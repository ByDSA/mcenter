/* eslint-disable @typescript-eslint/naming-convention */
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ModuleRef } from "@nestjs/core";

// Variable global para almacenar la referencia al ModuleRef
let globalModuleRef: ModuleRef | null = null;

// Función para establecer el ModuleRef globalmente (llamar desde main.ts o app.module.ts)
export function setGlobalModuleRef(moduleRef: ModuleRef) {
  globalModuleRef = moduleRef;
  console.log("🔧 ModuleRef global establecido para EventEmitter fallback");
}

// Función para obtener EventEmitter2 desde el inyector de dependencias
function getEventEmitterFromDI(): EventEmitter2 | null {
  if (!globalModuleRef)
    return null;

  try {
    const eventEmitter = globalModuleRef.get(EventEmitter2, {
      strict: false,
    } );

    console.log("🎯 EventEmitter2 obtenido desde el inyector de dependencias");

    return eventEmitter;
  } catch {
    return null;
  }
}

// Función alternativa que intenta obtener ModuleRef desde la instancia actual
function getEventEmitterFromInstanceDI(instance: any): EventEmitter2 | null {
  // Buscar ModuleRef en la instancia actual
  const moduleRef = findModuleRefBFS(instance);

  if (!moduleRef)
    return null;

  try {
    const eventEmitter = moduleRef.get(EventEmitter2, {
      strict: false,
    } );

    console.log("🎯 EventEmitter2 obtenido desde ModuleRef de la instancia");

    return eventEmitter;
  } catch {
    return null;
  }
}

function findModuleRefBFS(instance: any, maxDepth: number = 2): ModuleRef | null {
  const visited = new WeakSet();
  const queue: Array<{ obj: any;
depth: number;
path: string; }> = [{
  obj: instance,
  depth: 0,
  path: "this",
}];

  while (queue.length > 0) {
    const { obj, depth, path } = queue.shift()!;

    if (visited.has(obj) || depth > maxDepth)
      continue;

    visited.add(obj);

    // Verificar si el objeto actual es un ModuleRef
    if (obj && obj.constructor && obj.constructor.name === "ModuleRef") {
      console.log(`🎯 ModuleRef encontrado en: ${path}`);

      return obj;
    }

    if (!obj || typeof obj !== "object")
      continue;

    const propertyNames = new Set([
      ...Object.getOwnPropertyNames(obj),
      ...Object.keys(obj),
    ]);

    for (const prop of propertyNames) {
      if (prop.startsWith("__")
          || prop === "constructor"
          || prop === "prototype"
          || prop === "caller"
          || prop === "callee"
          || prop === "arguments")
        continue;

      try {
        const value = obj[prop];

        if (value !== null && value !== undefined && value !== obj) {
          queue.push( {
            obj: value,
            depth: depth + 1,
            path: `${path}.${prop}`,
          } );
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}

// Cache para evitar búsquedas repetitivas en la misma instancia
const eventEmitterCache = new WeakMap<any, EventEmitter2 | null>();

function findEventEmitterBFS(instance: any, maxDepth: number = 3): EventEmitter2 | null {
  // Verificar cache primero
  if (eventEmitterCache.has(instance))
    return eventEmitterCache.get(instance)!;

  const visited = new WeakSet();
  const queue: Array<{ obj: any;
depth: number;
path: string; }> = [{
  obj: instance,
  depth: 0,
  path: "this",
}];

  while (queue.length > 0) {
    const { obj, depth, path } = queue.shift()!;

    // Evitar bucles infinitos
    if (visited.has(obj) || depth > maxDepth)
      continue;

    visited.add(obj);

    // Verificar si el objeto actual es un EventEmitter2
    if (obj && obj instanceof EventEmitter2) {
      console.log(`🎯 EventEmitter2 encontrado en: ${path}`);
      eventEmitterCache.set(instance, obj);

      return obj;
    }

    // Si es null, undefined, o un tipo primitivo, continuar
    if (!obj || typeof obj !== "object")
      continue;

    // Obtener todas las propiedades del objeto (incluyendo no-enumerables)
    const propertyNames = new Set([
      ...Object.getOwnPropertyNames(obj),
      ...Object.keys(obj),
    ]);

    // Añadir propiedades al queue para el siguiente nivel
    for (const prop of propertyNames) {
      // Saltar propiedades que probablemente causen problemas
      if (prop.startsWith("__")
          || prop === "constructor"
          || prop === "prototype"
          || prop === "caller"
          || prop === "callee"
          || prop === "arguments")
        continue;

      try {
        const value = obj[prop];

        if (value !== null && value !== undefined && value !== obj) {
          queue.push( {
            obj: value,
            depth: depth + 1,
            path: `${path}.${prop}`,
          } );
        }
      } catch {
        // Algunas propiedades pueden no ser accesibles, ignorar
        continue;
      }
    }
  }

  // No encontrado, cachear null para evitar búsquedas futuras
  eventEmitterCache.set(instance, null);

  return null;
}

export function getEventEmitter(instance: any): EventEmitter2 | null {
  try {
    // 1. Primero, buscar en las propiedades de la instancia (BFS)
    const eventEmitterFromProps = findEventEmitterBFS(instance);

    if (eventEmitterFromProps)
      return eventEmitterFromProps;

    // 2. Segundo, intentar obtener desde ModuleRef de la instancia
    const eventEmitterFromInstanceDI = getEventEmitterFromInstanceDI(instance);

    if (eventEmitterFromInstanceDI)
      return eventEmitterFromInstanceDI;

    // 3. Tercero, usar el ModuleRef global como último recurso
    const eventEmitterFromGlobalDI = getEventEmitterFromDI();

    if (eventEmitterFromGlobalDI)
      return eventEmitterFromGlobalDI;

    return null;
  } catch (error) {
    console.warn("Error durante la búsqueda del EventEmitter2:", error);

    return null;
  }
}

// Nueva función para configurar fácilmente el ModuleRef global
export function setupEventEmitterDecorators(app: any) {
  try {
    const moduleRef = app.get(ModuleRef);

    setGlobalModuleRef(moduleRef);

    // Verificar que EventEmitter2 esté disponible
    const eventEmitter = moduleRef.get(EventEmitter2, {
      strict: false,
    } );

    if (eventEmitter)
      return true;
    else {
      console.warn("⚠️ EventEmitter2 no está registrado en el contenedor de dependencias");

      return false;
    }
  } catch (error) {
    console.error("❌ Error configurando EventEmitter decorators:", error);

    return false;
  }
}
