"use client";

import type { Params } from "./page";
import { use, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EpisodesBySeason } from "$shared/models/episodes";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodesApi } from "#modules/episodes/requests";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { SeriesFullPageCurrentCtx } from "#modules/episodes/series/FullPage/Series";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { useEpisode } from "#modules/episodes/hooks";

interface PageProps {
  params: Promise<Params>;
}

export function ClientPage( { params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const paramSeason = searchParams.get("season") ?? undefined;
  const [episodesBySeason, setEpisodesBySeason] = useState<EpisodesBySeason |
    null>(null);
  const updateEpisodesBySeason = async () => {
    const episodesApi = FetchApi.get(EpisodesApi);
    const res = await episodesApi.getEpisodesBySeason(id);
    const ret = res.data;

    if (ret) {
      for (const [_season, seasonEps] of Object.entries(ret)) {
        for (const ep of seasonEps)
          useEpisode.updateCacheWithMerging(ep.id, ep);
      }
    }

    setEpisodesBySeason(ret);

    return ret;
  };

  return (
    <AsyncLoader
      action={updateEpisodesBySeason}
      onSuccess={setEpisodesBySeason}
      errorElement={<PageItemNotFound />}
    >
      {episodesBySeason && (
        <LocalDataProvider
          data={episodesBySeason}
          setData={setEpisodesBySeason}>
          <SeriesFullPageCurrentCtx
            initialSeason={paramSeason}
            seriesId={id}
            updateEpisodesBySeason={updateEpisodesBySeason}
          />
        </LocalDataProvider>
      )}
    </AsyncLoader>
  );
}
