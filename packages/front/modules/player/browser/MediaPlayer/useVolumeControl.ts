import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import { visualToVolume, volumeToVisual } from "./volumeMapping";

/**
 * Hook compartido entre VolumeController (bottom bar) y VolumeSlider (fullscreen Effects).
 * Centraliza la lógica de actualización de volumen para que cualquier cambio futuro
 * (incluyendo el mapeo visual→volumen de volumeMapping.ts) afecte a ambos sliders.
 */
export function useVolumeControl() {
  const { volume, setVolume, audioElement } = useBrowserPlayer(
    useShallow((s) => ( {
      volume: s.volume,
      setVolume: s.setVolume,
      audioElement: s.audioElement,
    } )),
  );
  const updateAudioTagVolume = useCallback(
    (val: number) => {
      if (audioElement) {
        audioElement.volume = val;
        audioElement.muted = val === 0;
      }
    },
    [audioElement],
  );

  // Sincronizar el elemento de audio cuando se monta o cambia
  useEffect(() => {
    updateAudioTagVolume(volume);
  }, [audioElement]);

  /**
   * Recibe el volumen real [0,1] ya mapeado y lo aplica al estado y al audio tag.
   */
  const handleVolumeChange = useCallback(
    (newVol: number) => {
      setVolume(newVol);
      updateAudioTagVolume(newVol);
    },
    [setVolume, updateAudioTagVolume],
  );

  return {
    volume,
    handleVolumeChange,
    volumeToVisual,
    visualToVolume,
  };
}
