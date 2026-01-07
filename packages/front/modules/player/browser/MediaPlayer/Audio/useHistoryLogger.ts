import { useRef, useEffect } from "react";
import { showError } from "$shared/utils/errors/showError";
import { Mutex } from "async-mutex";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicHistoryApi } from "#musics/history/requests";
import { logger } from "#modules/core/logger";
import { useBrowserPlayer } from "../BrowserPlayerContext";

const STORAGE_KEY = "pending_music_history";
const mutex = new Mutex();

export function useHistoryLogger(engine: HTMLAudioElement | null) {
  const lastLoggedId = useRef<string | null>(null);
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const resourceId = currentResource?.resourceId;

  useEffect(() => {
    const handleOnline = async () => await syncPendingHistory(lastLoggedId);

    syncPendingHistory(lastLoggedId).catch(showError);
    window.addEventListener("online", handleOnline);

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    if (!engine || !resourceId)
      return;

    const handleActualPlayback = () => {
      // 1. Obtenemos la cola actual de localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      // 2. El "último ID" real es el de la sesión actual O el último que entró en la cola offline
      const lastIdInQueue = queue.length > 0 ? queue[queue.length - 1].musicId : null;
      const effectiveLastId = lastLoggedId.current ?? lastIdInQueue;

      // 3. Solo disparamos si es realmente distinto al último intento de registro
      if (effectiveLastId !== resourceId) {
        lastLoggedId.current = resourceId;
        fetchAddToHistory(resourceId).catch(showError);
      }
    };

    engine.addEventListener("playing", handleActualPlayback);

    return () => engine.removeEventListener("playing", handleActualPlayback);
  }, [engine, resourceId]);
}

async function fetchAddToHistory(
  musicId: string,
  timestamp: number = Math.round((new Date().getTime() / 1_000)),
): Promise<void> {
  const api = FetchApi.get(MusicHistoryApi);

  try {
    await api.createOne( {
      musicId,
      timestamp,
    } );
  } catch (error) {
    if (error instanceof Error && error.message === "Failed to fetch") {
      saveToOfflineQueue( {
        musicId,
        timestamp,
      } );
    } else
      throw error;
  }
}

function saveToOfflineQueue(item: { musicId: string;
timestamp: number; } ) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const queue = raw ? JSON.parse(raw) : [];

    queue.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    logger.error("No se pudo guardar en localStorage", e);
  }
}

async function syncPendingHistory(lastLoggedId: React.MutableRefObject<string | null>) {
  if (!navigator.onLine)
    return;

  await mutex.runExclusive(async () => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw)
      return;

    const queue: Array<{ musicId: string;
timestamp: number; }> = JSON.parse(raw);

    if (queue.length === 0)
      return;

    logger.info(`[History] Sincronizando ${queue.length} entradas pendientes...`);

    const remaining: typeof queue = [];

    for (const item of queue) {
      try {
        const api = FetchApi.get(MusicHistoryApi);

        await api.createOne(item);
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length > 0)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    else
      localStorage.removeItem(STORAGE_KEY);

    if (remaining.length === 0 && queue.length > 0) {
      // Si se sincronizó todo con éxito, el último de la cola es ahora el último logueado
      lastLoggedId.current = queue[queue.length - 1].musicId;
    }
  } );
}
