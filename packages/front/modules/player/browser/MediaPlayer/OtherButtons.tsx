/* eslint-disable @typescript-eslint/naming-convention */
import { RepeatOne, Repeat, Shuffle, VolumeOff, VolumeDown, VolumeUp, SkipPrevious, SkipNext, Replay10, Forward10, HighlightOff } from "@mui/icons-material";
import { useEffect, useState, useCallback, ComponentProps } from "react";
import { useShallow } from "zustand/react/shallow";
import { classes } from "#modules/utils/styles";
import { useBrowserPlayer, RepeatMode } from "./BrowserPlayerContext";
import styles from "./OtherButtons.module.css";
import { useAudioElement } from "./Audio/AudioContext";

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
      title="Repetición"
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
  const { isShuffle, setIsShuffle, setNextResource } = useBrowserPlayer(useShallow(s => ( {
    isShuffle: s.isShuffle,
    setIsShuffle: s.setIsShuffle,
    setNextResource: s.setNextResource,
  } )));
  const query = useBrowserPlayer(s=>s.query);
  const currentResource = useBrowserPlayer(s=>s.currentResource);

  return (
    <ControlButton
      active={isShuffle}
      title="Aleatoriedad"
      disabled={!!query && currentResource?.playlistId === null}
      onClick={(e) => {
        e.stopPropagation();
        setIsShuffle(!isShuffle);
        setNextResource(null);
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

  useEffect(()=> {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body)
        return;

      if (e.code === "KeyM")
        toggleMute(e);
    };

    window.addEventListener("keydown", handleKeyDown);

    return ()=> {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleMute]);

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

export const BackwardButton = ( { className }: {className?: string} ) => {
  const [audioElement] = useAudioElement();

  return <ControlButton
    className={classes(className)}
    title="Ir atrás 10 segundos"
    disabled={!audioElement}
    onClick={(e) => {
      e.stopPropagation();
      const { backward } = useBrowserPlayer.getState();

      backward(10, audioElement!);
    }}
  >
    <Replay10 />
  </ControlButton>;
};

export const ForwardButton = ( { className }: {className?: string} ) => {
  const [audioElement] = useAudioElement();

  return <ControlButton
    className={classes(className)}
    disabled={!audioElement}
    title="Ir adelante 10 segundos"
    onClick={(e) => {
      e.stopPropagation();
      const { forward } = useBrowserPlayer.getState();

      forward(10, audioElement!);
    }}
  >
    <Forward10 />
  </ControlButton>;
};

export const CloseButton = ( { className }: {className?: string} ) => {
  return <ControlButton
    className={classes(styles.closeButton, className)}
    title="Cerrar"
    onClick={(e) => {
      e.stopPropagation();
      const { close } = useBrowserPlayer.getState();

      close();
    }}
  >
    <HighlightOff />
  </ControlButton>;
};

export const PrevButton = ( { className }: {className?: string} ) => {
  const [audioElement] = useAudioElement();

  return <ControlButton
    className={classes(styles.prevNextButton, className)}
    title="Anterior"
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
    title="Siguiente"
    disabled={!hasNext()}
    onClick={async (e) => {
      e.stopPropagation();
      await next();
    }}
  >
    <SkipNext />
  </ControlButton>;
};
