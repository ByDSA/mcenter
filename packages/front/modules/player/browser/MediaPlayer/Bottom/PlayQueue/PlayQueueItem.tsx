import { memo } from "react";
import { MusicEntryElement } from "#modules/musics/musics/ListItem/MusicEntry";
import { PlayerStatus, PlaylistQueueItem as QItem } from "../../BrowserPlayerContext";

interface QueueItemProps {
  index: number;
  item: QItem;
  start: number;
  size: number;
  onClickPlay?: (prevStatus: PlayerStatus)=> void;
}

export const QueueItem = memo(( { index, item,
  start,
  onClickPlay,
  size }: QueueItemProps) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: `${size}px`,
        transform: `translateY(${start}px)`,
      }}
    >
      <MusicEntryElement
        musicId={item.resourceId}
        playable
        playlistInfo={{
          index,
          playlist: null,
        }}
        onClickPlay={onClickPlay}
      />
    </div>
  );
} );
