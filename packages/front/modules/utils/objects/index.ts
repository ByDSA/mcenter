import { diff } from "just-diff";

// Tipo recursivo para definir qué propiedades considerar
type PropsToConsider<T> = T extends object ? {
  [K in keyof T]?: true | (
    T[K] extends []
      ? true
      : T[K] extends object | null | undefined
        ? PropsToConsider<NonNullable<T[K]>>
        : true
  );
} : never;

type Settings<T> = {
  ignoreNewUndefined?: boolean;
  shouldMatch?: PropsToConsider<T>;
};

type Ret<T> = {
  entity: Partial<T>;
  unset?: (number | string)[][];
};

export function getDiff<T extends object>(old: T, neww: T, settings?: Settings<T>): Ret<T> {
  const d: Partial<T> = {};
  const dTree = diff(old, neww);
  const unset: (number | string)[][] = [];

  for (const ops of dTree) {
    const { value } = ops;

    if (settings?.ignoreNewUndefined && ops.op === "add" && value === undefined)
      continue;

    // Verificar si esta propiedad debe ser considerada
    if (settings?.shouldMatch && !shouldConsiderPath(ops.path, settings.shouldMatch))
      continue;

    if (typeof ops.path.at(-1) === "number") {
      const parentPath = ops.path.toSpliced(-1);
      const got = get(neww, parentPath);

      set(d, parentPath, got);
      continue;
    }

    switch (ops.op) {
      case "remove": {
        unset.push(ops.path);
        break;
      }
      case "add": {
        set(d, ops.path, value);
        break;
      }
      case "replace": {
        if (value === undefined)
          unset.push(ops.path);
        else
          set(d, ops.path, value);

        break;
      }
      default:
        throw new Error(`Unknown op: ${ops.op}`);
    }
  }

  const ret: Ret<T> = {
    entity: d as Partial<T>,
  };

  if (unset.length > 0)
    ret.unset = unset;

  return ret;
}

// Función para verificar si un path debe ser considerado según la configuración
function shouldConsiderPath(path: (number | string)[], propsToConsider: any): boolean {
  let current = propsToConsider;

  for (let i = 0; i < path.length; i++) {
    const key = path[i];

    // Si llegamos a un índice numérico (array), continuamos con el mismo nivel
    if (typeof key === "number")
      continue;

    // Si la propiedad actual no existe en la configuración, no debe considerarse
    if (!(key in current))
      return false;

    const value = current[key];

    // Si el valor es true, significa que esta propiedad
    // y todas sus sub-propiedades deben considerarse
    if (value === true)
      return true;

    // Si el valor es un objeto, continuamos navegando
    if (typeof value === "object" && value !== null)
      current = value;
    else {
      // Si no es true ni un objeto, no debe considerarse
      return false;
    }
  }

  // Si llegamos aquí, significa que el path completo está en la configuración
  return true;
}

function set<T extends object>(obj: Partial<T>, path: (number | string)[], value: any) {
  let i: number;

  for (i = 0; i < path.length - 1; i++) {
    obj[path[i]] ??= {};
    obj = obj[path[i]];
  }

  obj[path[i]] = value;
}

function get<T extends object>(obj: Partial<T>, path: (number | string)[]) {
  let i: number;

  for (i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]];

    if (obj === undefined)
      return undefined;
  }

  return obj[path[i]];
}

export function isModified<T extends object>(r1: T, r2: T, settings?: Settings<T>) {
  const diffs = getDiff(r1, r2, settings);
  const keysInDiff = Object.keys(diffs).length;
  const keysInEntity = Object.keys(diffs.entity).length;

  return keysInDiff > 1 || keysInEntity > 0;
}
