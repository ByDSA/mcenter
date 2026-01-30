"use client";

import type { Params } from "./page";
import { use, useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { useSearchParams } from "next/navigation";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodesApi } from "#modules/episodes/requests";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { SeriesFullPage, SeriesFullPageProps } from "#modules/episodes/series/FullPage/Series";
import { SeriesApi } from "#modules/episodes/series/requests";

interface PageProps {
  params: Promise<Params>;
}
type Data = SeriesFullPageProps;

export function ClientPage( { params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const paramSeason = searchParams.get("season") ?? undefined;
  const [seriesData, setSeriesData] = useState<Data |
    null>(null);
  const fetchData = async () => {
    const seriesApi = FetchApi.get(SeriesApi);
    const episodesApi = FetchApi.get(EpisodesApi);
    const res1 = await episodesApi.getEpisodesBySeason(id);
    const episodesBySeason = res1.data;
    const res = await seriesApi.getOneById(id);
    const series = res.data;

    assertIsDefined(series);

    return {
      series,
      episodesBySeason,
    } as Data;
  };

  return (
    <AsyncLoader
      action={fetchData}
      onSuccess={setSeriesData}
      errorElement={<PageItemNotFound />}
    >
      {seriesData && (
        <SeriesFullPage
          initialSeason={paramSeason}
          series={seriesData.series}
          episodesBySeason={seriesData.episodesBySeason}
        />
      )}
    </AsyncLoader>
  );
}
