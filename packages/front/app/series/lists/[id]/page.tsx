// front/app/series/lists/[id]/page.tsx
import type { Metadata } from "next";
import { fetchSeriesForMetadata } from "#modules/utils/server-metadata-fetch";
import { getMediumCoverUrl } from "#modules/image-covers/Selector/image-cover-utils";
import { i18nServerContext } from "#modules/core/i18n/server-locale";
import { ClientPage } from "./ClientPage";

export type Params = {
  id: string;
};

interface PageProps {
  params: Promise<Params>;
}

const DEFAULT_OG_IMAGE = "/og/series.png";

export async function generateMetadata( { params }: PageProps): Promise<Metadata> {
  const { LL } = await i18nServerContext();
  const { id } = await params;
  const series = await fetchSeriesForMetadata(id);
  const title: string = series?.name ?? LL.modules.episodes.series.search.oneNotFound();
  const seasonCount: number = series?.metadata?.countSeasons ?? 0;
  const episodeCount: number = series?.metadata?.countEpisodes ?? 0;
  const description = series
    ? `${LL.modules.episodes.series.seasons.count( {
      count: seasonCount,
    } )} · ${LL.modules.episodes.count( {
      count: episodeCount,
    } )}`
    : "";
  const imageUrl: string = series?.imageCover
    ? getMediumCoverUrl(series.imageCover)
    : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{
        url: imageUrl,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function Page( { params }: PageProps) {
  return <ClientPage params={params} />;
}
