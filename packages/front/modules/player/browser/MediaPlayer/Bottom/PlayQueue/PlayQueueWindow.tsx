import styles from "./PlayQueueWindow.module.css";
import { PlayQueue } from "./PlayQueue";
import { WindowTitle } from "./WindowTitle";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlayQueueWindowContent = () => {
  return (
    <>
      <WindowTitle>Lista de reproducción</WindowTitle>

      <PlayQueue className={styles.queue} />
    </>
  );
};
