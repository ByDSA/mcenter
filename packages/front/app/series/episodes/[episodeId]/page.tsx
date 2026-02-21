/* eslint-disable no-nested-ternary */
// front/app/series/episodes/[episodeId]/page.tsx
import type { Metadata } from "next";
import { fetchEpisodeForMetadata } from "#modules/utils/server-metadata-fetch";
import { getMediumCoverUrl } from "#modules/image-covers/Selector/image-cover-utils";
import { ClientPage } from "./ClientPage";

export type Params = {
  episodeId: string;
};

interface PageProps {
  params: Promise<Params>;
}

const DEFAULT_OG_IMAGE = "/og/series.png";

export async function generateMetadata( { params }: PageProps): Promise<Metadata> {
  const { episodeId } = await params;
  const episode = await fetchEpisodeForMetadata(episodeId);
  const seriesName: string | undefined = episode?.series?.name;
  const description: string = seriesName
    ? `${episode?.episodeKey} · ${seriesName}`
    : (episode?.episodeKey ?? "");
  const title: string = episode?.title ?? "Episodio no encontrado";
  const imageUrl: string = episode?.imageCover
    ? getMediumCoverUrl(episode.imageCover)
    : episode?.series?.imageCover
      ? getMediumCoverUrl(episode.series.imageCover)
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
