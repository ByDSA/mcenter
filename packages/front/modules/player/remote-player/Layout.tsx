"use client";

import { Equalizer, LiveTv, QueueMusic } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { FullscreenPlayerLayout } from "../common/FullscreenLayout";
import { Title } from "../common/Title";
import styles from "./Layout.module.css";
import { RemotePlayer } from "./Player";
import { RemotePlayQueue } from "./PlayQueue";

export function RemoteLayout() {
  return <section className={classes(styles.container)}><FullscreenPlayerLayout
    elements={[{
      iconTitle: "Reproductor",
      icon: <LiveTv />,
      content: <RemotePlayer />,
    }, {
      iconTitle: "Lista de reproducción",
      icon: <QueueMusic />,
      content: <section className={styles.playQueueWrapper}>
        <Title>Lista de reproducción</Title>
        <RemotePlayQueue className={styles.playQueue} />
      </section>,
    }, {
      iconTitle: "Efectos",
      icon: <Equalizer />,
      content: <span></span>,
    },
    ]}
  />
  </section>;
}
