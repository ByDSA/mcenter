import { showError } from "$shared/utils/errors/showError";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { MusicEntity } from "../../models";
import { useMusic } from "../../hooks";
import { usePlaylistSelectorModal } from "./Selector/modal";
import { MusicPlaylistsApi } from "./requests";

type AddToPlaylistContextMenuItemProps = {
  musicId: MusicEntity["id"];
};
export function AddToPlaylistContextMenuItem(
  props: AddToPlaylistContextMenuItemProps,
) {
  const { user } = useUser();
  const { openModal } = usePlaylistSelectorModal();

  if (!user)
    return null;

  const handleAddToPlaylist = (musicId: MusicEntity["id"]) => {
    if (!user)
      return;

    openModal( {
      title: "Añadir a playlist",
      onSelect: async (playlist) => {
        if (!playlist)
          return;

        try {
          const api = FetchApi.get(MusicPlaylistsApi);

          await api.addOneTrack(playlist.id, musicId);
          const musicTitle = (await useMusic.get(musicId))?.title;

          logger.info(`"${musicTitle}" añadida a "${playlist.name}"`);
        } catch (err) {
          showError(err);
        }
      },
    } )
      .catch(showError);
  };

  return ContextMenuItem( {
    label: "Añadir a playlist",
    onClick: () => {
      handleAddToPlaylist(props.musicId);
    },
  } );
}
