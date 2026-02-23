import { VolumeOff, VolumeDown, VolumeUp, SkipPrevious, SkipNext } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { classes } from "#modules/utils/styles";
import { BackwardButtonView, CloseButtonView, ControlButtonView, ForwardButtonView, RepeatButtonView, ShuffleButtonView } from "#modules/player/common/ControlButtonsView";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import styles from "./OtherButtons.module.css";

export const RepeatButton = () => {
  const { cycleRepeatMode, repeatMode } = useBrowserPlayer(useShallow(s => ( {
    cycleRepeatMode: s.cycleRepeatMode,
    repeatMode: s.repeatMode,
  } )));

  return (
    <RepeatButtonView
      repeatMode={repeatMode}
      onClick={()=>{
        cycleRepeatMode();
      }}
    />
  );
};

export const ShuffleButton = () => {
  const { isShuffle, setIsShuffle,
    setNextResource } = useBrowserPlayer(useShallow(s => ( {
    isShuffle: s.isShuffle,
    setIsShuffle: s.setIsShuffle,
    setNextResource: s.setNextResource,
  } )));
  const query = useBrowserPlayer(s=>s.query);
  const currentResource = useBrowserPlayer(s=>s.currentResource);

  return (
    <ShuffleButtonView
      isShuffle={isShuffle}
      disabled={!!query && currentResource?.playlistId === null}
      onClick={() => {
        setIsShuffle(!isShuffle);
        setNextResource(null);
      }}
    />
  );
};

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
          onMouseDown={e=> {
            e.preventDefault();
          }}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className={styles.volumeRange}
        />
      </div>
      <ControlButtonView onClick={toggleMute} className={classes(volume === 0
        && styles.inactive)}>
        {volumeIcon}
      </ControlButtonView>
    </div>
  );
};

export const BackwardButton = ( { className }: {className?: string} ) => {
  const audioElement = useBrowserPlayer(s=>s.audioElement);

  return <BackwardButtonView
    className={className}
    disabled={!audioElement}
    onClick={() => {
      const { backward } = useBrowserPlayer.getState();

      backward(10);
    }}
  />;
};

export const ForwardButton = ( { className }: {className?: string} ) => {
  const audioElement = useBrowserPlayer(s=>s.audioElement);

  return <ForwardButtonView
    className={className}
    disabled={!audioElement}
    onClick={() => {
      const { forward } = useBrowserPlayer.getState();

      forward(10);
    }}
  />;
};

export const CloseButton = ( { className }: {className?: string} ) => {
  return <CloseButtonView
    className={className}
    onClick={() => {
      const { close } = useBrowserPlayer.getState();

      close();
    }}
  />;
};

export const PrevButton = ( { className }: {className?: string} ) => {
  return <ControlButtonView
    className={classes(styles.prevNextButton, className)}
    title="Anterior"
    onClick={async () => {
      const { currentTime, hasPrev, setCurrentTime, prev } = useBrowserPlayer.getState();

      if (currentTime < 1 && hasPrev())
        await prev();
      else {
        setCurrentTime(0, {
          shouldUpdateAudioElement: true,
        } );
      }
    }}
  >
    <SkipPrevious />
  </ControlButtonView>;
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

  return <ControlButtonView
    className={classes(styles.prevNextButton, className)}
    title="Siguiente"
    disabled={!hasNext()}
    onClick={() => next()}
  >
    <SkipNext />
  </ControlButtonView>;
};
