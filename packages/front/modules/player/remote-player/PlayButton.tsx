"use client";

import { PlayButtonView } from "../common/PlayButtonView";
import styles from "../browser/MediaPlayer/PlayButton.module.css";
import { useRemotePlayer, useRemoteStatus } from "./RemotePlayerContext";

export const RemotePlayButton = () => {
  const { player } = useRemotePlayer();
  const status = useRemoteStatus();
  const state = status?.state ?? "stopped";
  // Mapear "stopped" a "paused" para que PlayButtonView muestre Play
  const uiStatus = state === "playing" ? "playing" : "paused";

  return (
    <PlayButtonView
      status={uiStatus}
      theme="white"
      className={styles.playButton}
      onClick={() => player.pauseToggle()}
    />
  );
};
