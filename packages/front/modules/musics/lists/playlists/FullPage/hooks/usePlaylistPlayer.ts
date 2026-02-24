import { useEffect } from "react";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { showError } from "$shared/utils/errors/showError";
import { playlistToQueue, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";

export const usePlaylistPlayer = (value: MusicPlaylistEntity) => {
  const playlistStatus = useBrowserPlayer(s=>s.currentResource?.playlistId === value.id
    ? s.status
    : "stopped");

  // Sincronizar la cola del player cuando cambia la playlist (reorden, añadir, quitar pistas)
  useEffect(() => {
    const player = useBrowserPlayer.getState();

    // Solo actuar si esta playlist es la que está en reproducción
    if (player.currentResource?.playlistId !== value.id)
      return;

    const currentItemId = player.currentResource.itemId;
    const currentQueueIndex = player.queueIndex;
    const newQueue = playlistToQueue(value);
    const newIndex = value.list.findIndex((item) => item.id === currentItemId);

    player.setQueue(newQueue);

    if (newIndex === -1) {
      // La pista en reproducción fue eliminada de la playlist.
      // Intentamos reproducir la que queda en esa misma posición (la que "cae" donde estaba).
      const fallbackIndex = Math.min(currentQueueIndex, newQueue.length - 1);

      if (fallbackIndex >= 0)
        player.playQueueIndex(fallbackIndex).catch(showError);
      else
        player.close(); // La playlist quedó vacía
    } else {
      // La pista sigue ahí (reorden u otro cambio): actualizar solo el índice
      player.setQueueIndex(newIndex);
    }
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
