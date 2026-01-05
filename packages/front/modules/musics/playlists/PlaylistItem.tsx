import React, { ReactNode } from "react";
import { SetState } from "#modules/utils/resources/useCrud";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { FetchApi } from "#modules/fetching/fetch-api";
import { ResourceEntryLoading } from "#modules/resources/ResourceEntryLoading";
import { MusicEntryElement } from "../musics/MusicEntry/MusicEntry";
import { genMusicEntryContextMenuContent } from "../musics/MusicEntry/ContextMenu";
import { useMusic } from "../hooks";
import { MusicPlaylistsApi } from "./requests";
import { MusicPlaylistEntity } from "./models";

export type ContextMenuProps = {
  onClick?: (e: React.MouseEvent<HTMLElement>)=> void;
  element?: ReactNode;
};

type PlaylistItemProps = NonNullable<Pick<Parameters<typeof MusicEntryElement>[0], "drag">> & {
  playlist: MusicPlaylistEntity;
  setPlaylist: SetState<MusicPlaylistEntity>;
  index: number;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistItem = ( { playlist,
  index,
  setPlaylist,
  drag }: PlaylistItemProps) => {
  const { user } = useUser();
  const { openMenu: _openMenu } = useContextMenuTrigger();
  const value = playlist.list[index];
  const usingMusic = useMusic(value.musicId);
  const { data: music } = usingMusic;
  const api = FetchApi.get(MusicPlaylistsApi);

  if (!music)
    return <ResourceEntryLoading drag={drag}/>;

  const contextMenuContent = <>
    {genMusicEntryContextMenuContent( {
      music,
      user,
    } )}
    {user?.id === playlist.ownerUserId && <ContextMenuItem
      label="Eliminar"
      theme="danger"
      onClick={async () => {
        await api.removeOneTrack( {
          playlistId: playlist.id,
          itemId: value.id,
        } );

        setPlaylist(old=> {
          if (!old)
            return old;

          const updatedList = old.list.filter((i) => i.id !== value.id);

          return {
            ...old,
            list: updatedList,
          };
        } );
      }}
    />
    }
  </>;

  return <MusicEntryElement
    musicId={music.id}
    playable
    playlistInfo={{
      playlist,
      index,
    }}
    drag={drag}
    contextMenu={{
      customContent: contextMenuContent,
    }}
  />;
};
