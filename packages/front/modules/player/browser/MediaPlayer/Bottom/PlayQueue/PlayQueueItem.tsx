import { MusicEntryElement } from "#modules/musics/musics/ListItem/MusicEntry";
import { classes } from "#modules/utils/styles";
import { PlayerStatus, PlaylistQueueItem as QItem } from "../../BrowserPlayerContext";
import styles from "./PlayQueueItem.module.css";

interface QueueItemProps {
  item: QItem;
  start: number;
  size: number;
  isCurrent?: boolean;
  isPriorityPending?: boolean;
  onClickPlay?: (prevStatus: PlayerStatus)=> void;
}
export const QueueItem = ( { item,
  start,
  onClickPlay,
  size,
  isPriorityPending }: QueueItemProps) => {
  return (
    <div
      className={classes(styles.item, isPriorityPending && styles.priorityItem)}
      style={ {
        height: `${size}px`,
        transform: `translateY(${start}px)`,
      } }
    >
      <MusicEntryElement
        musicId={item.resourceId}
        playable
        itemId={item.itemId ?? undefined}
        onClickPlay={onClickPlay}
        priorityItemId={isPriorityPending ? (item.itemId ?? undefined) : undefined}
      />
    </div>
  );
};
