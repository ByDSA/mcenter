"use client";

import type { Params } from "./page";
import { use } from "react";
import MusicLayout from "app/musics/music.layout";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { Music } from "#modules/musics/musics/FullPage/Music";
import { useMusic } from "#modules/musics/hooks";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { useOnAutoplay } from "#modules/utils/autoplay/useOnAutoplay";
import { useUser } from "#modules/core/auth/useUser";

interface PageProps {
  params: Promise<Params>;
}

export function ClientPage( { params }: PageProps) {
  const { musicId } = use(params);
  const { user } = useUser();

  useOnAutoplay( {
    data: musicId,
    play: (id)=>useBrowserPlayer.getState().playMusic(id),
  } );
  const ret = <AsyncLoader
    errorElement={<PageItemNotFound />}
    action={()=> {
      return useMusic.get(musicId, {
        hasUser: !!user,
      } );
    }}>
    <Music musicId={musicId}/>
  </AsyncLoader>;

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
