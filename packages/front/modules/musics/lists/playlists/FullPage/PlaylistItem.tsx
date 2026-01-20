import React, { ReactNode } from "react";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { FetchApi } from "#modules/fetching/fetch-api";
import { ResourceEntryLoading } from "#modules/resources/ListItem/ResourceEntryLoading";
import { MusicContextMenu } from "#modules/musics/musics/SettingsButton/Button";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { SetState } from "#modules/utils/react";
import { MusicEntryElement } from "../../../musics/ListItem/MusicEntry";
import { useMusic } from "../../../hooks";
import { MusicPlaylistsApi } from "../requests";
import { MusicPlaylistEntity } from "../models";

export type ContextMenuProps = {
  onClick?: (e: React.MouseEvent<HTMLElement>)=> void;
  element?: ReactNode;
};

type PlaylistItemProps = NonNullable<Pick<Parameters<typeof MusicEntryElement>[0], "drag">> & {
  playlist: MusicPlaylistEntity;
  setPlaylist: SetState<MusicPlaylistEntity>;
  index: number;
};

export const MusicPlaylistItem = ( { playlist,
  index,
  setPlaylist,
  drag }: PlaylistItemProps) => {
  const { user } = useUser();
  const { openMenu: _openMenu } = useContextMenuTrigger();
  const value = playlist.list[index];
  const usingMusic = useMusic(value.musicId, {
    debounce: true,
  } );
  const { data: music } = usingMusic;
  const api = FetchApi.get(MusicPlaylistsApi);

  if (!music)
    return <ResourceEntryLoading drag={drag}/>;

  const contextMenuContent = <LocalDataProvider
    data={music}
  >
    <MusicContextMenu />
    {user?.id === playlist.ownerUserId && <ContextMenuItem
      label="Quitar de la playlist"
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
  </LocalDataProvider>;

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
