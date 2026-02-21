// front/app/series/lists/[id]/page.tsx
import type { Metadata } from "next";
import { fetchSeriesForMetadata } from "#modules/utils/server-metadata-fetch";
import { getMediumCoverUrl } from "#modules/image-covers/Selector/image-cover-utils";
import { ClientPage } from "./ClientPage";

export type Params = {
  id: string;
};

interface PageProps {
  params: Promise<Params>;
}

const DEFAULT_OG_IMAGE = "/og/series.png";

export async function generateMetadata( { params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const series = await fetchSeriesForMetadata(id);
  const title: string = series?.name ?? "Serie no encontrada";
  const seasonCount: number = series?.metadata?.countSeasons ?? 0;
  const episodeCount: number = series?.metadata?.countEpisodes ?? 0;
  const description = series
    ? `${seasonCount} ${seasonCount === 1 ? "temporada" : "temporadas"} · \
${episodeCount} ${episodeCount === 1 ? "episodio" : "episodios"}`
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
