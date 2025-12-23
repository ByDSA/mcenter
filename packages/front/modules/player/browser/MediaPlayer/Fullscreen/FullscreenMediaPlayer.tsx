"use client";

import { KeyboardArrowDown, LiveTv } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { classes } from "#modules/utils/styles";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { genMusicEntryContextMenuContent } from "#modules/musics/musics/MusicEntry/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { AudioRef } from "../AudioTag";
import { ControlButton } from "../OtherButtons";
import { PlayQueueButtonView } from "../Bottom/PlayQueue/PlayQueueButtonView";
import { PlayQueue } from "../Bottom/PlayQueue/PlayQueue";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import styles from "./FullscreenMediaPlayer.module.css";
import { Player } from "./Player";

enum AppView {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Player = 0,
  Queue = 1,
}

type Props = {
  audioRef: AudioRef;
  close: ()=> void;
  isOpen: boolean;
};
export function FullscreenMediaPlayer( { audioRef, close, isOpen }: Props) {
  const [view, setView] = useState<AppView>(AppView.Player);
  const { user } = useUser();
  const currentRsource = useBrowserPlayer(s=>s.currentResource);
  const content = useMemo(()=>{
    switch (view) {
      case AppView.Queue:
        return <main className={styles.playQueueWrapper}>
          <h2 className={styles.playQueueTitle}>Lista de reproducción</h2>
          <PlayQueue
            className={styles.playQueue}
            onClickPlay={(_, prevStatus)=> {
              if (prevStatus === "stopped")
                setView(AppView.Player);
            }}
          />
        </main>;
      case AppView.Player:
      default:
        return <Player audioRef={audioRef}/>;
    }
  }, [view, audioRef]);
  const { openMenu } = useContextMenuTrigger();

  return <div
    className={classes(styles.container, !isOpen && styles.closed)}
    onClick={(e)=>e.stopPropagation()}
  >
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
      {view !== AppView.Queue && <PlayQueueButtonView
        onClick={()=> setView(AppView.Queue)} />}
      {view !== AppView.Player && <ControlButton
        onClick={()=> setView(AppView.Player)}
        title="Reproductor"
      >
        <LiveTv />
      </ControlButton>}
      <ControlButton
        className={styles.closeButton}
        onClick={()=>close()}
      >
        <KeyboardArrowDown />
      </ControlButton>
    </footer>
  </div>;
}
