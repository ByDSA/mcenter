"use client";

import { useEffect, useMemo } from "react";
import { Equalizer, KeyboardArrowUp } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { RevealArrow } from "#modules/ui-kit/RevealArrow/RevealArrow";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { PlayButton } from "../PlayButton";
import { PrevButton, NextButton, VolumeController, ShuffleButton, RepeatButton, ControlButton, CloseButton, BackwardButton, ForwardButton } from "../OtherButtons";
import { ProgressBar } from "../ProgressBar";
import { ProgressBarOnlyView } from "../ProgressBarOnlyView";
import { FullscreenMediaPlayer } from "../Fullscreen/FullscreenMediaPlayer";
import { Effects } from "../Fullscreen/Effects";
import styles from "./MediaPlayer.module.css";
import { TrackInfo } from "./TrackInfo";
import { PlayQueueButtonView } from "./PlayQueue/PlayQueueButtonView";
import { PlayQueueWindowContent } from "./PlayQueue/PlayQueueWindow";
import { useWindowContext } from "./PlayQueue/WindowProvider";
import { CurrentTimeLabel } from "./CurrentTimeLabel";
import { useWindowWidth } from "./useWindowWidth";
import { BIG_BREAKPOINT, SMALL_BREAKPOINT } from "./breakpoints";

export function BottomMediaPlayer() {
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const { mountNode: windowMountNode, open, close, isOpen,
    isFullscreen, currentWindowName } = useWindowContext();
  const width = useWindowWidth();
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
    { width >= BIG_BREAKPOINT && <CloseButton className={styles.closeButton}/>}
  </div>, [open, close, currentWindowName, width]);

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
         && <>
           <ProgressBar
             className={styles.progressBar}
           />
         </>)
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
              width >= SMALL_BREAKPOINT && <>
                <BackwardButton className={styles.backwardButton}/>
                <PrevButton className={styles.previousButton}/>
              </>
            }

            <PlayButton />

            <NextButton className={styles.nextButton} />
            {
              width >= SMALL_BREAKPOINT && <>
                <ForwardButton className={styles.backwardButton}/>
              </>
            }
            {
              width < SMALL_BREAKPOINT && <FullscreenButton />
            }
          </div>

          {(width < SMALL_BREAKPOINT
            ? null
            : width < BIG_BREAKPOINT
            && <div className={styles.revealArrowWrapper}>
              {
                width < BIG_BREAKPOINT && <footer className={styles.progressBarFooter}>
                  <CurrentTimeLabel />
                </footer>
              }
              <RevealArrow>
                <div className={styles.revealArrowInside}>
                  {extraControls}
                </div>
              </RevealArrow>
              <CloseButton className={styles.closeButton}/>
            </div>)
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
