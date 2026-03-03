import { VolumeOff, VolumeDown, VolumeUp } from "@mui/icons-material";
import React, { useEffect, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { classes } from "#modules/utils/styles";
import { ControlButtonView } from "#modules/player/common/ControlButtonsView";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import styles from "./VolumeController.module.css";

export const VolumeController = () => {
  const { volume, setVolume, audioElement } = useBrowserPlayer(
    useShallow(s => ( {
      volume: s.volume,
      setVolume: s.setVolume,
      audioElement: s.audioElement,
    }
    )),
  );

  useEffect(()=> {
    updateAudioTagVolume(volume);
  }, [audioElement]);
  const [prevVolume, setPrevVolume] = useState(1);
  const updateAudioTagVolume = useCallback((val: number) => {
    if (audioElement) {
      audioElement.volume = val;
      audioElement.muted = val === 0;
    }
  }, [audioElement]);
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    updateAudioTagVolume(newVol);
  };
  const toggleMute = () => {
    if (volume === 0)
      handleVolumeChange(prevVolume || 1);
    else {
      setPrevVolume(volume);
      handleVolumeChange(0);
    }
  };
  const toggleMuteMouse = (e: React.MouseEvent) => {
    e.stopPropagation();

    toggleMute();
  };
  const toggleMuteKey = (e: KeyboardEvent) => {
    e.preventDefault();

    toggleMute();
  };

  useEffect(()=> {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body)
        return;

      if (e.code === "KeyM")
        toggleMuteKey(e);
    };

    window.addEventListener("keydown", handleKeyDown);

    return ()=> {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleMuteKey]);

  // eslint-disable-next-line no-nested-ternary
  const volumeIcon = volume === 0 ? <VolumeOff /> : volume < 0.5 ? <VolumeDown /> : <VolumeUp />;

  return (
    <div className={styles.volumeContainer}>
      <div className={styles.volumeSliderContainer}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onMouseUp={e => {
            (e.target as HTMLInputElement).blur();
          }}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className={styles.volumeRange}
        />
      </div>
      <ControlButtonView onClick={toggleMuteMouse} className={classes(volume === 0
        && styles.inactive)}>
        {volumeIcon}
      </ControlButtonView>
    </div>
  );
};
