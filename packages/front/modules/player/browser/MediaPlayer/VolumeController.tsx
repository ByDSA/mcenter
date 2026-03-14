import { VolumeOff, VolumeDown, VolumeUp } from "@mui/icons-material";
import React, { ReactNode, useEffect, useState } from "react";
import { classes } from "#modules/utils/styles";
import { ControlButtonView } from "#modules/player/common/ControlButtonsView";
import { useVolumeControl } from "./useVolumeControl";
import styles from "./VolumeController.module.css";

export const VolumeController = () => {
  const { volume, handleVolumeChange, volumeToVisual, visualToVolume } = useVolumeControl();
  const [prevVolume, setPrevVolume] = useState(1);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body)
        return;

      if (e.code === "KeyM")
        toggleMuteKey(e);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleMuteKey]);

  let volumeIcon: ReactNode;

  if (volume === 0)
    volumeIcon = <VolumeOff />;
  else if (volume < 0.5)
    volumeIcon = <VolumeDown />;
  else
    volumeIcon = <VolumeUp />;

  return (
    <div className={styles.volumeContainer}>
      <div className={styles.volumeSliderContainer}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volumeToVisual(volume)}
          onMouseUp={(e) => {
            (e.target as HTMLInputElement).blur();
          }}
          onChange={(e) => handleVolumeChange(visualToVolume(parseFloat(e.target.value)))
          }
          className={styles.volumeRange}
        />
      </div>
      <ControlButtonView
        onClick={toggleMuteMouse}
        className={classes(volume === 0 && styles.inactive)}
      >
        {volumeIcon}
      </ControlButtonView>
    </div>
  );
};
