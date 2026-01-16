"use client";

import type { Params as SlugPageParams } from "../slug/[userSlug]/[querySlug]/page";
import { useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicQueryEntity } from "$shared/models/musics/queries";
import MusicLayout from "app/musics/music.layout";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicQueriesApi } from "#modules/musics/lists/queries/requests";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { MusicQueryFullPage } from "#modules/musics/lists/queries/FullPage/FullPage";
import { LocalDataProvider } from "#modules/utils/local-data-context";

type Params = { queryId: string };

interface PageProps {
  params: Promise<Params | SlugPageParams>;
}

export function ClientPage( { params }: PageProps) {
  const api = FetchApi.get(MusicQueriesApi);
  const [data, setData] = useState<MusicQueryEntity>();
  const ret = <AsyncLoader
    onSuccess={(d) => setData(d)}
    errorElement={<PageItemNotFound />}
    action={async () => {
      const resolvedParams = await params;
      let d: MusicQueryEntity | undefined = undefined;

      if ("userSlug" in resolvedParams) {
        const response = await api.getOneByCriteria( {
          filter: {
            slug: resolvedParams.querySlug,
            ownerUserSlug: resolvedParams.userSlug,
          },
          expand: ["imageCover"],
        } );

        d = response.data as MusicQueryEntity;
      } else if ("queryId" in resolvedParams) {
        const response = await api.getOneByCriteria( {
          filter: {
            id: resolvedParams.queryId,
          },
          expand: ["imageCover"],
        } );

        d = response.data as MusicQueryEntity;
      }

      assertIsDefined(d);

      return d;
    }}>
    <LocalDataProvider data={data!} setData={setData}>
      <MusicQueryFullPage />
    </LocalDataProvider>
  </AsyncLoader>;

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
