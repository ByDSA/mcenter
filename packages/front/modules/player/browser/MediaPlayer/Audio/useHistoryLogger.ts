import { useRef, useEffect } from "react";
import { fetchAddToHistory } from "./audioUtils";

export function useHistoryLogger(engine: HTMLAudioElement | null, resourceId: string | undefined) {
  const lastLoggedId = useRef<string | null>(null);

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
