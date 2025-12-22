import { classes } from "#modules/utils/styles";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import styles from "./ProgressBar.module.css";

type Props = {
  className?: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProgressBarOnlyView = ( { className }: Props) => {
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
