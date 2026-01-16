import { useEffect } from "react";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { playlistToQueue, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";

export const usePlaylistPlayer = (value: MusicPlaylistEntity) => {
  const playlistStatus = useBrowserPlayer(s=>s.currentResource?.playlistId === value.id
    ? s.status
    : "stopped");

  // Sincronizar cola cuando cambia la playlist
  useEffect(() => {
    const player = useBrowserPlayer.getState();

    if (!player.currentResource?.playlistId)
      return;

    player.setQueue(playlistToQueue(value));
    player.setQueueIndex(
      value.list.findIndex((item) => item.id === player.currentResource?.itemId),
    );
  }, [value]);

  const handlePlayPlaylist = async () => {
    if (value.list.length === 0)
      return;

    const player = useBrowserPlayer.getState();

    if (playlistStatus === "stopped") {
      await player.playPlaylist( {
        playlist: value,
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
