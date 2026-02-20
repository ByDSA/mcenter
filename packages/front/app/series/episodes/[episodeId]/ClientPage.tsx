"use client";

import type { Params } from "./page";
import { use } from "react";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { useEpisode } from "#modules/episodes/hooks";
import { useUser } from "#modules/core/auth/useUser";
import { EpisodeFullPage } from "#modules/episodes/FullPage/Episode";

interface PageProps {
  params: Promise<Params>;
}

export function ClientPage( { params }: PageProps) {
  const { episodeId } = use(params);
  const { user } = useUser();

  return (
    <AsyncLoader
      errorElement={<PageItemNotFound />}
      action={() => useEpisode.get(episodeId, {
        hasUser: !!user,
      } )
      }
    >
      <EpisodeFullPage episodeId={episodeId} />
    </AsyncLoader>
  );
}
