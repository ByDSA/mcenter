import { memo } from "react";
import { MusicEntryElement } from "#modules/musics/musics/MusicEntry/MusicEntry";
import { PlayerResource, PlayerStatus, useBrowserPlayer } from "../../BrowserPlayerContext";
import { useAudioRef } from "../../AudioContext";

interface QueueItemProps {
  index: number;
  item: PlayerResource;
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
  const audioRef = useAudioRef();
  const playingThisItemStatus: PlayerStatus = (() => {
    if (index === queueIndex)
      return playerStatus;

    return "stopped";
  } )();
  const handlePlay = () => {
    const player = useBrowserPlayer.getState();

    if (playingThisItemStatus === "playing")
      player.pause();
    else if (playingThisItemStatus === "paused")
      player.resume();
    else {
      player.playQueueIndex(index, {
        audioRef,
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
        data={item.music}
        setData={() => { /* */ }}
        index={index}
        play={{
          status: playingThisItemStatus,
          onClick: handlePlay,
        }}
      />
    </div>
  );
} );
