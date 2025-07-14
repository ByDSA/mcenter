import { diff } from "just-diff";

type Settings = {
  ignoreNewUndefined?: boolean;
};
type Ret = any;// MusicPatchOneByIdReq["body"];
export function getDiff<T extends object>(old: T, neww: T, settings?: Settings): Ret {
  const d: Partial<T> = {};
  const dTree = diff(old, neww);
  const unset: (number | string)[][] = [];

  for (const ops of dTree) {
    const { value } = ops;

    if (settings?.ignoreNewUndefined && ops.op === "add" && value === undefined)
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

  const ret: Ret = {
    entity: d as Partial<T>,
  };

  if (unset.length > 0)
    ret.unset = unset;

  return ret;
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

export function isModified<T extends object>(r1: T, r2: T, settings?: Settings) {
  const diffs = getDiff(r1, r2, settings);
  const keysInDiff = Object.keys(diffs).length;
  const keysInEntity = Object.keys(diffs.entity).length;

  return keysInDiff > 1 || keysInEntity > 0;
}
