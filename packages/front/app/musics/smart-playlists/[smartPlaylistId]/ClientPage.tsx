"use client";

import type { Params as SlugPageParams } from "../slug/[userSlug]/[smartPlaylistSlug]/page";
import { useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicSmartPlaylistEntity } from "$shared/models/musics/smart-playlists";
import MusicLayout from "app/musics/music.layout";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicSmartPlaylistsApi } from "#modules/musics/lists/smart-playlists/requests";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { MusicSmartPlaylistFullPage } from "#modules/musics/lists/smart-playlists/FullPage/FullPage";
import { LocalDataProvider } from "#modules/utils/local-data-context";

type Params = { smartPlaylistId: string };

interface PageProps {
  params: Promise<Params | SlugPageParams>;
}

export function ClientPage( { params }: PageProps) {
  const api = FetchApi.get(MusicSmartPlaylistsApi);
  const [data, setData] = useState<MusicSmartPlaylistEntity>();
  const ret = <AsyncLoader
    onSuccess={(d) => setData(d)}
    errorElement={<PageItemNotFound />}
    action={async () => {
      const resolvedParams = await params;
      let d: MusicSmartPlaylistEntity | undefined = undefined;

      if ("userSlug" in resolvedParams) {
        const response = await api.getOneByCriteria( {
          filter: {
            slug: resolvedParams.smartPlaylistSlug,
            ownerUserSlug: resolvedParams.userSlug,
          },
          expand: ["imageCover"],
        } );

        d = response.data as MusicSmartPlaylistEntity;
      } else if ("smartPlaylistId" in resolvedParams) {
        const response = await api.getOneByCriteria( {
          filter: {
            id: resolvedParams.smartPlaylistId,
          },
          expand: ["imageCover"],
        } );

        d = response.data as MusicSmartPlaylistEntity;
      }

      assertIsDefined(d);

      return d;
    }}>
    <LocalDataProvider data={data!} setData={setData}>
      <MusicSmartPlaylistFullPage />
    </LocalDataProvider>
  </AsyncLoader>;

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
