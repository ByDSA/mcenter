"use client";

import { useState, useEffect, useMemo } from "react";
import { Equalizer, KeyboardArrowUp } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { RevealArrow } from "#modules/ui-kit/RevealArrow/RevealArrow";
import { PlayerResource, useBrowserPlayer } from "../BrowserPlayerContext";
import { PlayButton } from "../PlayButton";
import { PrevButton, NextButton, VolumeController, ShuffleButton, RepeatButton, ControlButton } from "../OtherButtons";
import { ProgressBar } from "../ProgressBar";
import { ProgressBarOnlyView } from "../ProgressBarOnlyView";
import { FullscreenMediaPlayer } from "../Fullscreen/FullscreenMediaPlayer";
import { useAudioRef } from "../AudioContext";
import { Effects } from "../Fullscreen/Effects";
import styles from "./MediaPlayer.module.css";
import { TrackInfo } from "./TrackInfo";
import { PlayQueueButtonView } from "./PlayQueue/PlayQueueButtonView";
import { PlayQueueWindowContent } from "./PlayQueue/PlayQueueWindow";
import { useWindowContext } from "./PlayQueue/WindowProvider";

const SMALL_BREAKPOINT = 600;

export function BottomMediaPlayer() {
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const { mountNode: windowMountNode, open, close, isOpen,
    isFullscreen, currentWindowName } = useWindowContext();
  const width = useWindowWidth();
  const audioRef = useAudioRef();
  const extraControls = useMemo(()=><div className={styles.extraControls}>
    <VolumeController />
    <ShuffleButton />
    <RepeatButton />
    <QueueMusicButton/>
    <ControlButton onClick={async (e)=> {
      e.stopPropagation();

      if (isOpen && currentWindowName === "effects")
        await close();
      else {
        await open( {
          name: "effects",
          className: styles.effectsWindow,
          content: <div className={styles.wrapper}><Effects /> </div>,
        } );
      }
    }}>
      <Equalizer />
    </ControlButton>
  </div>, [audioRef, open, close]);

  useEffect(()=> {
    if (isOpen) {
      if (
        (isFullscreen && width >= SMALL_BREAKPOINT) || (!isFullscreen && width < SMALL_BREAKPOINT)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        close();
      }
    }
  }, [width, isOpen, isFullscreen]);

  useMediaSessionHandlers(currentResource);

  if (!currentResource)
    return null;

  return (
    <>
      {windowMountNode}
      <div
        className={styles.playerContainer}>
        {(width >= SMALL_BREAKPOINT
         && <ProgressBar
           audioRef={audioRef}
           className={styles.progressBar}
         />)
           || <ProgressBarOnlyView
             className={styles.progressBar}
           />
        }

        <div
          className={styles.playerContent}
          onClick={
            width < SMALL_BREAKPOINT
              ? (async (e)=> {
                e.stopPropagation();

                await open( {
                  fullscreen: true,
                  content: <FullscreenMediaPlayer />,
                } );
              } )
              : undefined}
        >
          <TrackInfo />

          <div className={styles.controlsSection}>
            {
              width >= SMALL_BREAKPOINT && <PrevButton audioRef={audioRef} />
            }

            <PlayButton />

            <NextButton className={styles.nextButton} />
            {
              width < SMALL_BREAKPOINT && <FullscreenButton />
            }
          </div>

          {(width < SMALL_BREAKPOINT
            ? null
            : width < 850
            && <div className={styles.revealArrowWrapper}>
              <RevealArrow>
                <div className={styles.revealArrowInside}>
                  {extraControls}
                </div>
              </RevealArrow></div>)
          || extraControls
          }
        </div>
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const QueueMusicButton = () => {
  const { open, isOpen, close, currentWindowName } = useWindowContext();

  return <>
    <PlayQueueButtonView
      active={isOpen}
      onClick={async () => {
        if (isOpen && currentWindowName === "queue")
          await close();
        else {
          await open( {
            name: "queue",
            content: <PlayQueueWindowContent />,
          } );
        }
      }}
    />
  </>;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const FullscreenButton = () => {
  const { open } = useWindowContext();

  return <>
    <ControlButton
      className={classes(styles.fullscreenButton)}
      title="Reproductor completo"
      onClick={async (e) => {
        e.stopPropagation();
        await open( {
          fullscreen: true,
          content: <FullscreenMediaPlayer />,
        } );
      }}
    >
      <KeyboardArrowUp />
    </ControlButton>
  </>;
};

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Función que actualiza el estado
    const handleResize = () => setWidth(window.innerWidth);

    // Suscribirse al evento de cambio de tamaño
    window.addEventListener("resize", handleResize);

    // Limpiar el evento al desmontar el componente para evitar fugas de memoria
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function useMediaSessionHandlers(currentResource: PlayerResource | null) {
  const audioRef = useAudioRef();

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentResource)
      return;

    const { next, prev, resume, pause, stop, hasPrev, hasNext } = useBrowserPlayer.getState();

    navigator.mediaSession.metadata = new MediaMetadata( {
      title: currentResource.ui.title,
      artist: currentResource.ui.artist,
      album: currentResource.ui.album,
      artwork: currentResource.ui.coverImg
        ? [{
          src: currentResource.ui.coverImg,
          sizes: "512x512",
          type: "image/png",
        }]
        : undefined,
    } );

  type Action = [MediaSessionAction, ()=>(Promise<void> | void)];
  const actionHandlers: Action[] = [
    ["play", () => {
      resume();
      navigator.mediaSession.playbackState = "playing";
    }],
    ["pause", () => {
      pause();
      navigator.mediaSession.playbackState = "paused";
    }],
    ["stop", () => {
      stop();
      navigator.mediaSession.playbackState = "none";
    }],
    ...(hasPrev()
      ? [["previoustrack", () => prev()] as Action]
      : []),
    ...(hasNext() ? [["nexttrack", () => next()] as Action] : []),
    ["seekbackward", () => {
      audioRef.current!.currentTime = Math.max(audioRef.current!.currentTime - 10, 0);
    }],
    ["seekforward", () => {
      audioRef.current!.currentTime = Math.min(
        audioRef.current!.currentTime + 10,
        audioRef.current!.duration,
      );
    }],
  ];

  actionHandlers.forEach(([action, handler]) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      console.warn(`El handler ${action} no es soportado.`);
    }
  } );

  return () => {
    actionHandlers.forEach(([action]) => {
      navigator.mediaSession.setActionHandler(action, null);
    } );
  };
  }, [currentResource, audioRef]);
}
