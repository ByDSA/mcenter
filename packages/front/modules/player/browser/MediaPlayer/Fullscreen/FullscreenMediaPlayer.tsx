"use client";

import { Equalizer, KeyboardArrowDown, LiveTv } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { classes } from "#modules/utils/styles";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { genMusicEntryContextMenuContent } from "#modules/musics/musics/MusicEntry/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { ControlButton } from "../OtherButtons";
import { PlayQueueButtonView } from "../Bottom/PlayQueue/PlayQueueButtonView";
import { PlayQueue } from "../Bottom/PlayQueue/PlayQueue";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { useWindowContext } from "../Bottom/PlayQueue/WindowProvider";
import { useAudioRef } from "../AudioContext";
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
  const { user } = useUser();
  const audioRef = useAudioRef();
  const { close } = useWindowContext();
  const currentRsource = useBrowserPlayer(s=>s.currentResource);
  const content = useMemo(()=>{
    switch (view) {
      case AppView.Queue:
        return <main className={styles.playQueueWrapper}>
          <Title>Lista de reproducción</Title>
          <PlayQueue
            className={styles.playQueue}
            onClickPlay={(_, prevStatus)=> {
              if (prevStatus === "stopped")
                setView(AppView.Player);
            }}
          />
        </main>;
      case AppView.Effects:
        return <Effects />;
      case AppView.Player:
      default:
        return <Player audioRef={audioRef}/>;
    }
  }, [view, audioRef]);
  const { openMenu } = useContextMenuTrigger();
  const isActiveQueue = view === AppView.Queue;
  const isActivePlayer = view === AppView.Player;
  const isActiveEffects = view === AppView.Effects;

  return <>
    <header className={styles.header}>
      {currentRsource && <SettingsButton onClick={(e)=>openMenu( {
        event: e as any,
        content: genMusicEntryContextMenuContent( {
          music: currentRsource.music,
          user,
        } ),
      } )} />}
    </header>
    {content}
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
