/* eslint-disable @typescript-eslint/naming-convention */
import { RepeatOne, Repeat, Shuffle, VolumeOff, VolumeDown, VolumeUp, SkipPrevious, SkipNext } from "@mui/icons-material";
import { useEffect, useState, useCallback, ComponentProps } from "react";
import { useShallow } from "zustand/react/shallow";
import { classes } from "#modules/utils/styles";
import { useBrowserPlayer, RepeatMode } from "./BrowserPlayerContext";
import styles from "./OtherButtons.module.css";
import { useAudioElement } from "./AudioContext";

export const ControlButton = ( { active = true,
  className,
  children,
  ...props }: ComponentProps<"button"> & {
  active?: boolean;
} ) => {
  return (
    <button
      {...props}
      className={classes(styles.controlButton, active ? styles.active : styles.inactive, className)}
    >
      {children}
    </button>
  );
};

/* eslint-disable @typescript-eslint/naming-convention */
export const RepeatButton = () => {
  const { cycleRepeatMode, repeatMode } = useBrowserPlayer(useShallow(s => ( {
    cycleRepeatMode: s.cycleRepeatMode,
    repeatMode: s.repeatMode,
  } )));

  return (
    <ControlButton
      active={repeatMode !== RepeatMode.Off}
      onClick={(e)=>{
        e.stopPropagation();
        cycleRepeatMode();
      }}
    >
      {repeatMode === RepeatMode.One ? <RepeatOne fontSize="small" /> : <Repeat fontSize="small" />}
    </ControlButton>
  );
};

export const ShuffleButton = () => {
  const { isShuffle, setIsShuffle } = useBrowserPlayer(useShallow(s => ( {
    isShuffle: s.isShuffle,
    setIsShuffle: s.setIsShuffle,
  } )));
  const query = useBrowserPlayer(s=>s.query);
  const currentResource = useBrowserPlayer(s=>s.currentResource);

  return (
    <ControlButton
      active={isShuffle}
      disabled={!!query && currentResource?.playlistId === null}
      onClick={(e) => {
        e.stopPropagation();
        setIsShuffle(!isShuffle);
      }}
    >
      <Shuffle fontSize="small" />
    </ControlButton>
  );
};

export const VolumeController = () => {
  const { volume, setVolume } = useBrowserPlayer(
    useShallow(s => ( {
      volume: s.volume,
      setVolume: s.setVolume,
    }
    )),
  );
  const [audioElement] = useAudioElement();

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
  const toggleMute = (e) => {
    e.stopPropagation();

    if (volume === 0)
      handleVolumeChange(prevVolume || 1);
    else {
      setPrevVolume(volume);
      handleVolumeChange(0);
    }
  };
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
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className={styles.volumeRange}
        />
      </div>
      <ControlButton onClick={toggleMute} className={classes(volume === 0
        && styles.inactive)}>
        {volumeIcon}
      </ControlButton>
    </div>
  );
};

export const PrevButton = ( { audioElement, className }: {audioElement: HTMLAudioElement | null;
className?: string;} ) => {
  return <ControlButton
    className={classes(styles.prevNextButton, className)}
    onClick={async (e) => {
      e.stopPropagation();
      const { currentTime, hasPrev, setCurrentTime, prev } = useBrowserPlayer.getState();

      if (currentTime < 1 && hasPrev())
        await prev();
      else {
        setCurrentTime(0, {
          audioElement,
        } );
      }
    }}
  >
    <SkipPrevious />
  </ControlButton>;
};
type NextButtonProps = {
className?: string;
};
export const NextButton = ( { className }: NextButtonProps) => {
  const next = useBrowserPlayer(s=>s.next);
  const hasNext = useBrowserPlayer(s=>s.hasNext);
  // eslint-disable-next-line no-underscore-dangle
  const _1 = useBrowserPlayer(s=>s.isShuffle);
  // eslint-disable-next-line no-underscore-dangle
  const _2 = useBrowserPlayer(s=>s.repeatMode);

  return <ControlButton
    className={classes(styles.prevNextButton, className)}
    disabled={!hasNext()}
    onClick={async (e) => {
      e.stopPropagation();
      await next();
    }}
  >
    <SkipNext />
  </ControlButton>;
};
