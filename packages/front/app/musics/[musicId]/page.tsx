import type { Metadata } from "next";
import { PATH_ROUTES } from "$shared/routing";
import { SearchParams } from "next/dist/server/request/search-params";
import { backendUrl } from "#modules/requests";
import { redirectIfMediaPlayer } from "#modules/utils/redirect-media-player";
import { fetchMusicForMetadata } from "#modules/utils/server-metadata-fetch";
import { getMediumCoverUrl } from "#modules/image-covers/Selector/image-cover-utils";
import { ClientPage } from "./ClientPage";

export type Params = {
  musicId: string;
};

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

const DEFAULT_OG_IMAGE = "/og/music.png";

export async function generateMetadata( { params }: PageProps): Promise<Metadata> {
  const { musicId } = await params;
  const music = await fetchMusicForMetadata(musicId);
  const title: string = music?.title ?? "Música no encontrada";
  const description: string = music
    ? `${music.artist}${music.album ? " · " + music.album : ""}${music.year
      ? " · "
    + music.year
      : ""}`
    : "";
  const imageUrl: string = music?.imageCover
    ? getMediumCoverUrl(music.imageCover)
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

export default async function Page( { params, searchParams }: PageProps) {
  const { musicId } = await params;

  await redirectIfMediaPlayer( {
    url: backendUrl(
      PATH_ROUTES.musics.withParams(musicId),
    ),
    searchParams,
  } );

  return <ClientPage params={params} />;
}
