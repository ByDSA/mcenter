import { classes } from "#modules/utils/styles";
import styles from "../../common/ProgressBar.module.css";
import { useBrowserPlayer } from "./BrowserPlayerContext";

type Props = {
  className?: string;
};

export const ProgressBarSmall = ( { className }: Props) => {
  const currentTime = useBrowserPlayer(s=>s.currentTime);
  const duration = useBrowserPlayer(s=>s.duration);
  const percentage = duration ? currentTime / duration * 100 : 0;

  return (
    <div
      className={classes(styles.container, styles.onlyView, className)}
    >
      <div className={styles.progressBackground}>
        <div className={styles.progressFill} style={{
          width: `${percentage}%`,
        }} />
      </div>
    </div>
  );
};
