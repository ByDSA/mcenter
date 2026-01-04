import { useRef, useEffect } from "react";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { getUrl } from "./audioUtils";

export function useHistoryLogger(engine: HTMLAudioElement | null) {
  const lastLoggedId = useRef<string | null>(null);
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const resourceId = currentResource?.resourceId;

  useEffect(() => {
    if (!engine || !resourceId)
      return;

    const handleActualPlayback = () => {
      // Solo lanzamos si es una canción nueva
      if (lastLoggedId.current !== resourceId) {
        lastLoggedId.current = resourceId;
        fetchAddToHistory(resourceId).catch(() => {
          // Si falla, permitimos reintento limpiando el ref
          lastLoggedId.current = null;
        } );
      }
    };

    // El evento 'playing' se dispara cuando el audio realmente comienza tras carga o pausa
    engine.addEventListener("playing", handleActualPlayback);

    return () => engine.removeEventListener("playing", handleActualPlayback);
  }, [engine, resourceId]);
}

async function fetchAddToHistory(musicId: string, _timestamp: number = new Date().getTime()) {
  const url = await getUrl(musicId);

  if (url) {
    await fetch(url.href, {
      credentials: "include",
      cache: "no-store",
      headers: {
        Range: "bytes=0-0",
      },
    } );
  }
}
