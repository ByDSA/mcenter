import { useEffect } from "react";
import { playlistToQueue, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { PlaylistEntity } from "../types";

export const usePlaylistPlayer = (value: PlaylistEntity) => {
  const playlistStatus = useBrowserPlayer(s=>s.currentResource?.playlist?.id === value.id
    ? s.status
    : "stopped");

  // Sincronizar cola cuando cambia la playlist
  useEffect(() => {
    const player = useBrowserPlayer.getState();

    if (!player.currentResource?.playlist)
      return;

    player.setQueue(playlistToQueue(value));
    player.setQueueIndex(
      value.list.findIndex((item) => item.id === player.currentResource?.playlist?.itemId),
    );
  }, [value]);

  const handlePlayPlaylist = () => {
    if (value.list.length === 0)
      return;

    const player = useBrowserPlayer.getState();

    if (playlistStatus === "stopped") {
      player.playPlaylistItem( {
        playlist: value,
        index: 0,
        ownerSlug: value.ownerUser?.slug,
      } );
    } else if (playlistStatus === "paused")
      player.resume();
    else if (playlistStatus === "playing")
      player.pause();
  };

  return {
    playlistStatus,
    handlePlayPlaylist,
  };
};
