import type { PlaylistEntity } from "./Playlist/types";
import React, { ReactNode } from "react";
import { SetState } from "#modules/utils/resources/useCrud";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { MusicEntryElement } from "../musics/MusicEntry/MusicEntry";
import { MusicEntity } from "../models";
import { genMusicEntryContextMenuContent } from "../musics/MusicEntry/ContextMenu";
import { MusicPlaylistsApi } from "./requests";

export type ContextMenuProps = {
  onClick?: (e: React.MouseEvent<HTMLElement>)=> void;
  element?: ReactNode;
};

type PlaylistItemProps = NonNullable<Pick<Parameters<typeof MusicEntryElement>[0], "drag">> & {
  playlist: PlaylistEntity;
  setPlaylist: SetState<PlaylistEntity>;
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
  const { music } = value;
  const api = FetchApi.get(MusicPlaylistsApi);
  const setData: SetState<MusicEntity> = a => {
    const musicUpdateData = typeof a === "function" ? a(undefined) : a;

    if (!musicUpdateData)
      return;

    const newMusic = musicUpdateData;
    const targetMusicId = musicUpdateData.id;

    setPlaylist(old => {
      if (!old || !old.list)
        return old;

      const updatedList = old.list.map(listItem => {
        if (listItem.musicId === targetMusicId) {
          const oldMusic = listItem.music;
          const mergedMusic = {
            ...oldMusic,
            ...newMusic,
          };

          return {
            ...listItem,
            music: mergedMusic,
          } as PlaylistEntity["list"][0];
        }

        return listItem;
      } );

      return {
        ...old,
        list: updatedList,
      } as PlaylistEntity;
    } );
  };
  const contextMenuContent = <>
    {genMusicEntryContextMenuContent( {
      music,
      setMusic: setData,
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
  const playingThisItemStatus = useBrowserPlayer(s=> {
    const item = playlist.list[index];

    if (item.id === s.currentResource?.playlist?.itemId)
      return s.status;
    else
      return "stopped";
  } );

  return <MusicEntryElement
    data={music}
    play={{
      status: playingThisItemStatus,
      onClick: ()=>{
        const player = useBrowserPlayer.getState();

        if (playingThisItemStatus === "playing") {
          player.pause();

          return;
        } else if (playingThisItemStatus === "paused") {
          player.resume();

          return;
        }

        player.playPlaylistItem( {
          playlist,
          index,
          ownerSlug: playlist.ownerUser?.slug,
        } );
      },
    }}
    setData={setData}
    index={index}
    drag={drag}
    contextMenu={{
      customContent: contextMenuContent,
    }}
  />;
};
