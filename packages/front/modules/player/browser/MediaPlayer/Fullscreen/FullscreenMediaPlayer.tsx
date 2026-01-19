"use client";

import { Equalizer, KeyboardArrowDown, LiveTv } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { classes } from "#modules/utils/styles";
import { useMusic } from "#modules/musics/hooks";
import { MusicSettingsButton } from "#modules/musics/musics/SettingsButton/Button";
import { ControlButton } from "../OtherButtons";
import { PlayQueueButtonView } from "../Bottom/PlayQueue/PlayQueueButtonView";
import { PlayQueue } from "../Bottom/PlayQueue/PlayQueue";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { useWindowContext } from "../Bottom/PlayQueue/WindowProvider";
import styles from "./FullscreenMediaPlayer.module.css";
import { Player } from "./Player";
import { Effects } from "./Effects";
import { Title } from "./Title";

enum AppView {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Player = 0,
  Queue = 1,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Effects = 2,
}

type Props = {
  onClose?: ()=> void;
};
export function FullscreenMediaPlayer( { onClose }: Props) {
  const [view, setView] = useState<AppView>(AppView.Player);
  const audioElement = useBrowserPlayer(s=>s.audioElement);
  const { close } = useWindowContext();
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const content = useMemo(()=>{
    switch (view) {
      case AppView.Queue:
        return <section className={styles.playQueueWrapper}>
          <Title>Lista de reproducción</Title>
          <PlayQueue
            className={styles.playQueue}
            onClickPlay={(_, prevStatus)=> {
              if (prevStatus === "stopped")
                setView(AppView.Player);
            }}
          />
        </section>;
      case AppView.Effects:
        return <Effects />;
      case AppView.Player:
      default:
        return <Player />;
    }
  }, [view, audioElement]);
  const isActiveQueue = view === AppView.Queue;
  const isActivePlayer = view === AppView.Player;
  const isActiveEffects = view === AppView.Effects;
  const { data: music } = useMusic(currentResource?.resourceId ?? null);

  return <>
    <header className={styles.header}>
      {music && <MusicSettingsButton musicId={music.id}/>}
    </header>
    <main className={styles.main}>
      {content}
    </main>
    <footer className={styles.footer}>
      <aside>
        <article>
          <ControlButton
            className={classes(isActivePlayer && styles.activeViewButton)}
            disabled={isActivePlayer}
            onClick={isActivePlayer ? undefined : ()=> setView(AppView.Player)}
            title="Reproductor"
          >
            <LiveTv />
          </ControlButton>
          {isActivePlayer && underlineElement}
        </article>
        <article>
          <PlayQueueButtonView
            disabled={isActiveQueue}
            className={classes(isActiveQueue && styles.activeViewButton)}
            onClick={isActiveQueue ? undefined : ()=> setView(AppView.Queue)} />
          {isActiveQueue && underlineElement}
        </article>
        <article>
          <ControlButton
            disabled={isActiveEffects}
            className={classes(isActiveEffects && styles.activeViewButton)}
            onClick={isActiveEffects ? undefined : ()=> setView(AppView.Effects)}
            title="Efectos"
          >
            <Equalizer />
          </ControlButton>
          {isActiveEffects && underlineElement}
        </article>
      </aside>
      <ControlButton
        className={styles.closeButton}
        onClick={async ()=>{
          onClose?.();
          await close();
        }}
      >
        <KeyboardArrowDown />
      </ControlButton>
    </footer>
  </>;
}

const underlineElement = <span className={styles.underline}></span>;
