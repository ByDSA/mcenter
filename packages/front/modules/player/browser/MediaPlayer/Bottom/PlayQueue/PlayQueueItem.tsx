import { memo } from "react";
import { MusicEntryElement } from "#modules/musics/musics/MusicEntry/MusicEntry";
import { PlayerStatus, PlaylistQueueItem as QItem, useBrowserPlayer } from "../../BrowserPlayerContext";
import { useAudioElement } from "../../AudioContext";

interface QueueItemProps {
  index: number;
  item: QItem;
  playerStatus: PlayerStatus;
  start: number;
  size: number;
  onClickPlay?: (prevStatus: PlayerStatus)=> void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const QueueItem = memo(( { index,
  item,
  playerStatus,
  start,
  onClickPlay,
  size }: QueueItemProps) => {
  const queueIndex = useBrowserPlayer(s=>s.queueIndex);
  const [audioElement] = useAudioElement();
  const playingThisItemStatus: PlayerStatus = (() => {
    if (index === queueIndex)
      return playerStatus;

    return "stopped";
  } )();
  const handlePlay = async () => {
    const player = useBrowserPlayer.getState();

    if (playingThisItemStatus === "playing")
      player.pause();
    else if (playingThisItemStatus === "paused")
      player.resume();
    else {
      await player.playQueueIndex(index, {
        audioElement,
      } );
    }

    onClickPlay?.(playingThisItemStatus);
  };

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
        index={index}
        play={{
          status: playingThisItemStatus,
          onClick: handlePlay,
        }}
      />
    </div>
  );
} );
