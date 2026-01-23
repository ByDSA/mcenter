"use client";

import type { Params as SlugPageParams } from "../slug/[userSlug]/[playlistSlug]/page";
import type { Params } from "./page";
import { useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import MusicLayout from "app/musics/music.layout";
import { MusicPlaylistFullPage } from "#modules/musics/lists/playlists/FullPage/Playlist";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "#modules/musics/lists/playlists/requests";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { useUser } from "#modules/core/auth/useUser";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { useMusic } from "#modules/musics/hooks";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { useAutoplay } from "#modules/utils/autoplay/useAutoplay";

interface PageProps {
  params: Promise<Params | SlugPageParams>;
}

export function ClientPage( { params }: PageProps) {
  const api = FetchApi.get(MusicPlaylistsApi);
  const { user } = useUser();
  const [data, setData] = useState<MusicPlaylistEntity>();

  useAutoplay( {
    play: ()=>useBrowserPlayer.getState().playPlaylist( {
      playlist: data!,
    } ),
  } );
  const ret = <AsyncLoader
    onSuccess={(d)=>{
      setData(d);

      for (const entry of d.list) {
        if (entry.music)
          useMusic.updateCacheWithMerging(entry.musicId, entry.music);
      }
    }}
    errorElement={<PageItemNotFound />}
    action={async ()=> {
      const resolvedParams = (await params);
      let d: MusicPlaylistEntity | undefined = undefined;

      if ("userSlug" in resolvedParams) {
        const { userSlug, playlistSlug } = resolvedParams;
        const response = await api.getOneByCriteria( {
          filter: {
            slug: playlistSlug,
            ownerUserSlug: userSlug,
          },
          expand: ["ownerUserPublic", "imageCover"],
        } );

        d = response.data as MusicPlaylistEntity;

        if (d.ownerUserId !== user?.id && d.visibility === "public" && !d.ownerUser) {
          d.ownerUser = {
            slug: userSlug,
          } as any;
        }
      } else if ("playlistId" in resolvedParams) {
        const response = await api.getOneByCriteria( {
          filter: {
            id: resolvedParams.playlistId,
          },
          expand: ["ownerUserPublic", "imageCover"],
        } );

        d = response.data as MusicPlaylistEntity;
      }

      assertIsDefined(d);

      return {
        ...d,
        list: d.list?.map(e=> ( {
          ...e,
          music: e.music
            ? {
              ...e.music,
            }
            : undefined,
        } )),
      };
    }}>
    <MusicPlaylistFullPage value={data!} setValue={setData}/>
  </AsyncLoader>;

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
