import { KeyboardArrowDown } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import buttonStyles from "../../OtherButtons.module.css";
import styles from "./PlayQueueWindow.module.css";
import { PlayQueue } from "./PlayQueue";

type Props = {
  closeQueue: ()=> void;
  className?: string;
  state: "closed" | "open";
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlayQueueWindow = ( { closeQueue, className, state }: Props) => {
  return (
    <>
      <div
        className={classes(styles.backdrop, state === "closed" && styles.closed)}
        onClick={closeQueue}
      />
      <div className={classes(styles.container, state === "closed" && styles.closed, className)}>
        <main>
          <h2 className={styles.title}>Lista de reproducción</h2>

          <PlayQueue className={styles.queue} />
        </main>

        <footer>
          <button
            onClick={closeQueue}
            className={classes(buttonStyles.controlButton, styles.closeButton)}
          >
            <KeyboardArrowDown />
          </button>
        </footer>
      </div>
    </>
  );
};
