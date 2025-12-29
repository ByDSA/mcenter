"use client";

import type { Params } from "./page";
import { useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicEntity } from "$shared/models/musics";
import MusicLayout from "app/musics/music.layout";
import { FetchApi } from "#modules/fetching/fetch-api";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { useUser } from "#modules/core/auth/useUser";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { MusicsApi } from "#modules/musics/requests";
import { Music } from "#modules/musics/musics/Music/Music";

interface PageProps {
  params: Promise<Params>;
}

export function ClientPage( { params }: PageProps) {
  const api = FetchApi.get(MusicsApi);
  const { user } = useUser();
  const [data, setData] = useState<MusicEntity>();
  const ret = <AsyncLoader
    onSuccess={(d)=>setData(d)}
    errorElement={<PageItemNotFound />}
    action={async ()=> {
      const { musicId } = (await params);
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
    <Music value={data!}/>
  </AsyncLoader>;

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
