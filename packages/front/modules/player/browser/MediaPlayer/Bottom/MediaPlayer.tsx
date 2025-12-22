"use client";

import { createPortal } from "react-dom";
import { useState, useEffect, useMemo } from "react";
import { KeyboardArrowUp } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { RevealArrow } from "#modules/ui-kit/RevealArrow/RevealArrow";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { AudioRef } from "../AudioTag";
import { PlayButton } from "../PlayButton";
import { PrevButton, NextButton, VolumeController, ShuffleButton, RepeatButton, ControlButton } from "../OtherButtons";
import { ProgressBar } from "../ProgressBar";
import { ProgressBarOnlyView } from "../ProgressBarOnlyView";
import { FullscreenMediaPlayer } from "../Fullscreen/FullscreenMediaPlayer";
import { useAudioRef } from "../AudioContext";
import styles from "./MediaPlayer.module.css";
import { TrackInfo } from "./TrackInfo";
import { PlayQueueButtonView } from "./PlayQueue/PlayQueueButtonView";
import { PlayQueueWindow } from "./PlayQueue/PlayQueueWindow";

const SMALL_BREAKPOINT = 600;

export function BottomMediaPlayer() {
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const [playQueueMountNode, setPlayQueueMountNode] = useState<HTMLDivElement | null>(null);
  const [fullscreenMountNode, setFullscreenMountNode] = useState<HTMLDivElement | null>(null);
  const width = useWindowWidth();
  const audioRef = useAudioRef();
  const extraControls = useMemo(()=><div className={styles.extraControls}>
    <VolumeController />
    <ShuffleButton />
    <RepeatButton />
    <QueueMusicButton targetNode={playQueueMountNode} />
  </div>, [audioRef, playQueueMountNode]);

  if (!currentResource)
    return null;

  return (
    <>
      <div ref={setFullscreenMountNode} />
      <div ref={setPlayQueueMountNode} />
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
              ? ((e)=> {
                e.stopPropagation();

                const { setIsOpenFullscreen } = useBrowserPlayer.getState();

                setIsOpenFullscreen(true);
              } )
              : undefined}
        >
          <TrackInfo />

          <div className={styles.controlsSection}>
            <PrevButton audioRef={audioRef} className={styles.hideOnSmall} />

            <PlayButton />

            <NextButton className={styles.nextButton} />
            <FullscreenButton
              audioRef={audioRef}
              targetNode={fullscreenMountNode}/>
          </div>

          {(width < SMALL_BREAKPOINT
            ? null
            : width < 800
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

function useDelayedRender(active: boolean, delay: number) {
  const [shouldRender, setShouldRender] = useState(active);

  useEffect(() => {
    if (active)
      setShouldRender(true);
    else {
      const timeout = setTimeout(() => setShouldRender(false), delay);

      return () => clearTimeout(timeout);
    }
  }, [active, delay]);

  return shouldRender;
}

type QueueMusicButtonProps = {
targetNode: HTMLDivElement | null;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const QueueMusicButton = ( { targetNode }: QueueMusicButtonProps) => {
  const [isOpen, setIsQueueOpen] = useState(false);
  const shouldRender = useDelayedRender(isOpen, 200);

  return <>
    <PlayQueueButtonView
      active={isOpen}
      onClick={() => setIsQueueOpen((o) => !o)}
    />
    {targetNode && shouldRender && createPortal(
      <PlayQueueWindow
        closeQueue={() => setIsQueueOpen(false)}
        state={isOpen ? "open" : "closed"}
      />,
      targetNode,
    )}
  </>;
};

type FullscreenButtonProps = QueueMusicButtonProps & {
  audioRef: AudioRef;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const FullscreenButton = ( { audioRef, targetNode }: FullscreenButtonProps) => {
  const isOpen = useBrowserPlayer(s=>s.isOpenFullscreen);
  const setIsOpen = useBrowserPlayer(s=>s.setIsOpenFullscreen);
  const shouldRender = useDelayedRender(isOpen, 200);
  const width = useWindowWidth();

  useEffect(()=> {
    if (width >= SMALL_BREAKPOINT && isOpen)
      setIsOpen(false);
  }, [width]);

  return <>
    <ControlButton
      className={classes(styles.showOnSmall, styles.fullscreenButton)}
      title="Reproductor completo"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(true);
      }}
    >
      <KeyboardArrowUp />
    </ControlButton>
    {targetNode && shouldRender && createPortal(
      <FullscreenMediaPlayer
        audioRef={audioRef}
        isOpen={isOpen}
        close={()=>setIsOpen(false)}
      />,
      targetNode,
    )}
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
