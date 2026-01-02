"use client";

import { useState, useEffect, useMemo } from "react";
import { Equalizer, KeyboardArrowUp } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { RevealArrow } from "#modules/ui-kit/RevealArrow/RevealArrow";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { PlayButton } from "../PlayButton";
import { PrevButton, NextButton, VolumeController, ShuffleButton, RepeatButton, ControlButton } from "../OtherButtons";
import { ProgressBar } from "../ProgressBar";
import { ProgressBarOnlyView } from "../ProgressBarOnlyView";
import { FullscreenMediaPlayer } from "../Fullscreen/FullscreenMediaPlayer";
import { useAudioElement } from "../Audio/AudioContext";
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
  const [audioElement] = useAudioElement();
  const extraControls = useMemo(()=><div className={styles.extraControls}>
    <VolumeController />
    <ShuffleButton />
    <RepeatButton />
    <QueueMusicButton/>
    <ControlButton
      active={isOpen && currentWindowName === "effects"}
      onClick={async (e)=> {
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
  </div>, [audioElement, open, close, currentWindowName]);

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

  if (!currentResource)
    return null;

  return (
    <>
      {windowMountNode}
      <div
        className={styles.playerContainer}>
        {(width >= SMALL_BREAKPOINT
         && <ProgressBar
           audioElement={audioElement}
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
              width >= SMALL_BREAKPOINT && <PrevButton audioElement={audioElement} />
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
  const active = isOpen && currentWindowName === "queue";

  return <>
    <PlayQueueButtonView
      active={active}
      onClick={async () => {
        if (active)
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
