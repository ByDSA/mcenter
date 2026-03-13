import { showError } from "$shared/utils/errors/showError";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
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
  const { openModal } = usePlaylistSelectorModal( {
    isAdded: d=>!!d.list.find(i=>i.musicId === props.musicId),
  } );
  const { LL } = useI18nContext();

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
          const res = await api.addOneTrack(playlist.id, musicId);
          const musicTitle = (await useMusic.get(musicId))?.title ?? "";

          if (res.warnings) {
            for (const w of res.warnings) {
              if (w.code === "DUPLICATES_SKIPPED") {
                for (const id of w.skippedMusicIds) {
                  if (id === musicId) {
                    logger.warn(
                      LL.modules.musics.lists.playlists.alreadyAdded( {
                        musicTitle,
                        playlistName: playlist.name,
                      } ),
                    );
                  }
                }
              }
            }
          } else {
            logger.info(LL.modules.musics.lists.playlists.added( {
              musicTitle,
              playlistName: playlist.name,
            } ));
          }
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
