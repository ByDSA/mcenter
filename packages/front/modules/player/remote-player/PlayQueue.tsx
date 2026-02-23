"use client";

import { showError } from "$shared/utils/errors/showError";
import { PlayerPlaylistElement } from "$shared/models/player";
import { classes } from "#modules/utils/styles";
import { useRemotePlayer, useRemotePlaylist } from "./RemotePlayerContext";
import styles from "./PlayQueue.module.css";

// ---------------------------------------------------------------------------
// Componente de un elemento de la lista
// ---------------------------------------------------------------------------
type ItemProps = {
  item: PlayerPlaylistElement;
  isCurrent?: boolean;
  onPlay: (id: number)=> void;
};

const RemotePlayQueueItem = ( { item, isCurrent, onPlay }: ItemProps) => {
  return (
    <li
      className={classes(styles.item, isCurrent && styles.current)}
      onClick={() => onPlay(item.id)}
      title={item.name}
    >
      <span className={styles.name}>{item.name}</span>
      {item.duration > 0 && (
        <span className={styles.duration}>{formatDuration(item.duration)}</span>
      )}
    </li>
  );
};

// ---------------------------------------------------------------------------
// Lista completa
// ---------------------------------------------------------------------------
type Props = {
  className?: string;
};

export const RemotePlayQueue = ( { className }: Props) => {
  const { player } = useRemotePlayer();
  const { previous, current, next } = useRemotePlaylist();
  const handlePlay = (id: number) => {
    player.play(id).catch(showError);
  };
  // Construimos la lista ordenada: anteriores (invertidos) → actual → siguientes
  const allItems: Array<{ item: PlayerPlaylistElement;
isCurrent: boolean; }> = [
  ...previous.toReversed().map((item) => ( {
    item,
    isCurrent: false,
  } )),
  ...(current
    ? [{
      item: current,
      isCurrent: true,
    }]
    : []),
  ...next.map((item) => ( {
    item,
    isCurrent: false,
  } )),
];

  if (allItems.length === 0) {
    return (
      <div className={classes(styles.empty, className)}>
        <span>No hay elementos en la lista</span>
      </div>
    );
  }

  return (
    <ul className={classes(styles.list, className)}>
      {allItems.map(( { item, isCurrent } ) => (
        <RemotePlayQueueItem
          key={item.id}
          item={item}
          isCurrent={isCurrent}
          onPlay={handlePlay}
        />
      ))}
    </ul>
  );
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function formatDuration(secs: number): string {
  if (secs < 0)
    return "--:--";

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
