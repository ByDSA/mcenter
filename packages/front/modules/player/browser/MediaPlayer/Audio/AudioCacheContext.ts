/* eslint-disable import/no-cycle */
import { create } from "zustand";
import { type NextAction, useBrowserPlayer } from "../BrowserPlayerContext";

interface CacheEntry {
  blobUrl: string;
  timeoutId?: ReturnType<typeof setTimeout>;
  ttl?: number; // Guardamos el valor para renovarlo
}

interface AddOptions {
  ttl?: number;
}

type AudioCacheState = {
  cache: Record<string, CacheEntry>;
  has: (resourceId: string)=> boolean;
  hasNextAction: (nextAction: NextAction)=> boolean;
  add: (resourceId: string, blob: Blob, options?: AddOptions)=> string;
  remove: (resourceId: string)=> void;
  get: (resourceId: string)=> string | undefined;
  clear: ()=> void;
};

export const useAudioCache = create<AudioCacheState>((set, get) => ( {
  cache: {},
  has: (resourceId) => {
    return get().cache[resourceId] !== undefined;
  },
  hasNextAction: (nextAction: NextAction) => {
    const { queue } = useBrowserPlayer.getState();
    const { has } = get();

    if (nextAction.type === "INDEX") {
      if (nextAction.payload === -1)
        return false;

      return has(queue[nextAction.payload].resourceId);
    }

    return has(nextAction.payload.id);
  },
  add: (resourceId, blob, options) => {
    // 1. Limpiamos si ya existe para evitar duplicados y timers huérfanos
    get().remove(resourceId);

    const blobUrl = URL.createObjectURL(blob);
    const ttl = options?.ttl;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // 2. Si hay TTL, programamos el borrado inicial
    if (ttl) {
      timeoutId = setTimeout(() => {
        get().remove(resourceId);
      }, 1_000 * ttl);
    }

    set((state) => ( {
      cache: {
        ...state.cache,
        [resourceId]: {
          blobUrl,
          timeoutId,
          ttl,
        },
      },
    } ));

    return blobUrl;
  },

  get: (resourceId) => {
    const entry = get().cache[resourceId];

    if (!entry)
      return undefined;

    // 3. Lógica de Renovación (Sliding Expiration)
    if (entry.ttl && entry.timeoutId) {
      // Limpiamos el timer viejo
      clearTimeout(entry.timeoutId);

      // Creamos un nuevo timer con el mismo tiempo original
      const newTimeoutId = setTimeout(() => {
        get().remove(resourceId);
      }, 1_000 * entry.ttl);

      // Actualizamos el cache solo con el nuevo timeoutId
      set((state) => ( {
        cache: {
          ...state.cache,
          [resourceId]: {
            ...entry,
            timeoutId: newTimeoutId,
          },
        },
      } ));
    }

    return entry.blobUrl;
  },

  remove: (resourceId) => {
    const { cache } = get();
    const entry = cache[resourceId];

    if (!entry)
      return;

    const currentResourceId = useBrowserPlayer.getState().currentResource?.resourceId;

    // 1. Si es el recurso actual y tiene TTL configurado:
    // NO borramos. RENOVAMOS el tiempo de vida (Slide Expiration).
    if (resourceId === currentResourceId && entry.ttl) {
      // Limpiamos el timer viejo (por seguridad, aunque haya expirado)
      if (entry.timeoutId)
        clearTimeout(entry.timeoutId);

      // Programamos un NUEVO intento de borrado en el futuro
      const newTimeoutId = setTimeout(() => {
        get().remove(resourceId);
      }, 1_000 * entry.ttl);

      // Actualizamos el estado con el nuevo ID del timer
      set((state) => ( {
        cache: {
          ...state.cache,
          [resourceId]: {
            ...entry,
            timeoutId: newTimeoutId,
          },
        },
      } ));

      return; // Salimos para evitar la eliminación
    }

    // 2. Lógica normal de eliminación (si no coincide o no tiene TTL)
    URL.revokeObjectURL(entry.blobUrl);

    if (entry.timeoutId)
      clearTimeout(entry.timeoutId);

    set((state) => {
      const newCache = {
        ...state.cache,
      };

      delete newCache[resourceId];

      return {
        cache: newCache,
      };
    } );
  },

  clear: () => {
    Object.values(get().cache).forEach((entry) => {
      URL.revokeObjectURL(entry.blobUrl);

      if (entry.timeoutId)
        clearTimeout(entry.timeoutId);
    } );
    set( {
      cache: {},
    } );
  },
} ));
