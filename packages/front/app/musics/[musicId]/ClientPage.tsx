"use client";

import type { Params } from "./page";
import { use } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicEntity } from "$shared/models/musics";
import MusicLayout from "app/musics/music.layout";
import { FetchApi } from "#modules/fetching/fetch-api";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { useUser } from "#modules/core/auth/useUser";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { MusicsApi } from "#modules/musics/requests";
import { Music } from "#modules/musics/musics/FullPage/Music";
import { useMusic } from "#modules/musics/hooks";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { useAutoplay } from "#modules/utils/autoplay/useAutoplay";

interface PageProps {
  params: Promise<Params>;
}

export function ClientPage( { params }: PageProps) {
  const { musicId } = use(params);
  const api = FetchApi.get(MusicsApi);
  const { user } = useUser();
  const usingMusic = useMusic(musicId);

  useAutoplay( {
    data: usingMusic.data,
    play: (d)=>useBrowserPlayer.getState().playMusic(d.id),
  } );
  const ret = <AsyncLoader
    onSuccess={(d)=>useMusic.updateCacheWithMerging(musicId, d)}
    errorElement={<PageItemNotFound />}
    action={async ()=> {
      const response = await api.getOneByCriteria( {
        filter: {
          id: musicId,
        },
        expand: ["fileInfos", ...(user ? ["favorite", "userInfo"] as const : [])],
      } );
      const d: MusicEntity | undefined = response.data as MusicEntity;

      assertIsDefined(d);

      return d;
    }}>
    <Music value={usingMusic.data!}/>
  </AsyncLoader>;

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
