import React, { ReactNode } from "react";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { FetchApi } from "#modules/fetching/fetch-api";
import { ResourceEntryLoading } from "#modules/resources/ListItem/ResourceEntryLoading";
import { MusicContextMenu } from "#modules/musics/musics/SettingsButton/Button";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { SetState } from "#modules/utils/react";
import { MusicEntryElement } from "../../../../musics/ListItem/MusicEntry";
import { useMusic } from "../../../../hooks";
import { MusicPlaylistsApi } from "../../requests";
import { MusicPlaylistEntity } from "../../models";

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

  // Quitar TODAS las ocurrencias de la canción de la playlist localmente.
  // Se filtra por musicId (no por index) porque al borrar la música de la BD
  // debe desaparecer en todos los puestos donde aparezca.
  const removeFromPlaylist = () => {
    setPlaylist(old => {
      if (!old)
        return old;

      return {
        ...old,
        list: old.list.filter((item) => item.musicId !== value.musicId),
      };
    } );
  };
  const contextMenuContent = <LocalDataProvider
    data={music}
  >
    <MusicContextMenu onDelete={removeFromPlaylist} />
    {user?.id === playlist.ownerUserId && <>
      {index !== 0 && <ContextMenuItem
        label="Mover al principio"
        onClick={() => {
          const item = playlist.list[index];
          const newList = [item, ...playlist.list.filter((_, i) => i !== index)];

          setPlaylist(old => {
            if (!old)
              return old;

            return {
              ...old,
              list: newList,
            };
          } );
          api.moveOneTrack(playlist.id, value.id, 1).catch(console.error);
        }}
      />}
      {index !== playlist.list.length - 1 && <ContextMenuItem
        label="Mover al final"
        onClick={() => {
          const item = playlist.list[index];
          const newList = [...playlist.list.filter((_, i) => i !== index), item];

          setPlaylist(old => {
            if (!old)
              return old;

            return {
              ...old,
              list: newList,
            };
          } );
          api.moveOneTrack(playlist.id, value.id, playlist.list.length).catch(console.error);
        }}
      />}
      <ContextMenuItem
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
    </>
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
