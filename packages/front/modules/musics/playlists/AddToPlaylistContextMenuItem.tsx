import { UserPayload } from "$shared/models/auth";
import { showError } from "$shared/utils/errors/showError";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu/ContextMenu";
import { MusicEntity } from "../models";
import { usePlaylistSelectorModal } from "./list-selector/modal";
import { MusicPlaylistsApi } from "./requests";

type AddToPlaylistContextMenuItemProps = {
  user: UserPayload | null;
  musicId: MusicEntity["id"];
};
export function AddToPlaylistContextMenuItem(
  props: AddToPlaylistContextMenuItemProps,
) {
  const { user } = props;
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
          logger.info(`Canción añadida a "${playlist.name}"`);
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
