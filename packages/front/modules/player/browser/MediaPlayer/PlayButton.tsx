import { useBrowserPlayer } from "./BrowserPlayerContext";
import { PlayButtonView } from "./PlayButtonView";
import styles from "./PlayButton.module.css";

/* eslint-disable @typescript-eslint/naming-convention */
export const PlayButton = () => {
  const status = useBrowserPlayer(s=>s.status);

  return <PlayButtonView
    status={status}
    theme="white"
    className={styles.playButton}
    onClick={(e) => {
      e.stopPropagation();
      const player = useBrowserPlayer.getState();

      if (player.status === "playing")
        player.pause();
      else
        player.resume();
    }}
  />;
};
