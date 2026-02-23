"use client";

import { Equalizer, KeyboardArrowDown, LiveTv, QueueMusic } from "@mui/icons-material";
import { useRef } from "react";
import { useMusic } from "#modules/musics/hooks";
import { MusicSettingsButton } from "#modules/musics/musics/SettingsButton/Button";
import { FullscreenLayoutHandle, FullscreenPlayerLayout } from "#modules/player/common/FullscreenLayout";
import { ControlButtonView } from "#modules/player/common/ControlButtonsView";
import { PlayQueue } from "../Bottom/PlayQueue/PlayQueue";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { useWindowContext } from "../Bottom/PlayQueue/WindowProvider";
import { Title } from "../../../common/Title";
import styles from "./Layout.module.css";
import { Player } from "./Player";
import { Effects } from "./Effects";

type Props = {
  onClose?: ()=> void;
};
export function FullscreenLayout( { onClose }: Props) {
  const { close } = useWindowContext();
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const { data: music } = useMusic(currentResource?.resourceId ?? null);
  const layoutRef = useRef<FullscreenLayoutHandle>(null);

  return <FullscreenPlayerLayout
    ref={layoutRef}
    headerActions={music && <MusicSettingsButton musicId={music.id}/>}
    elements={[{
      iconTitle: "Reproductor",
      icon: <LiveTv />,
      content: <Player />,
    }, {
      iconTitle: "Lista de reproducción",
      icon: <QueueMusic />,
      content: <section className={styles.playQueueWrapper}>
        <Title>Lista de reproducción</Title>
        <PlayQueue
          className={styles.playQueue}
          onClickPlay={(_, _prevStatus)=> {
            layoutRef.current?.setView(0);
          }}
        />
      </section>,
    }, {
      iconTitle: "Efectos",
      icon: <Equalizer />,
      content: <Effects />,
    },
    ]}
    bottomRight={<ControlButtonView
      className={styles.closeButton}
      onClick={async ()=>{
        onClose?.();
        await close();
      }}
    >
      <KeyboardArrowDown />
    </ControlButtonView>}
  />;
}
