import { PlayButtonView } from "../../common/PlayButtonView";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import styles from "./PlayButton.module.css";

export const PlayButton = () => {
  const status = useBrowserPlayer(s=>s.status);

  return <PlayButtonView
    status={status}
    theme="white"
    className={styles.playButton}
    onClick={() => {
      const player = useBrowserPlayer.getState();

      if (player.status === "playing")
        player.pause();
      else
        player.resume();
    }}
  />;
};
