import type { Metadata } from "next";
import { PATH_ROUTES } from "$shared/routing";
import { SearchParams } from "next/dist/server/request/search-params";
import { backendUrl } from "#modules/requests";
import { redirectIfMediaPlayer } from "#modules/utils/redirect-media-player";
import { fetchPlaylistForMetadata } from "#modules/utils/server-metadata-fetch";
import { getMediumCoverUrl } from "#modules/image-covers/Selector/image-cover-utils";
import { ClientPage } from "./ClientPage";

export type Params = {
  trackNumber?: number;
  playlistId: string;
};

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

const DEFAULT_OG_IMAGE = "/og/music.png";

export async function generateMetadata( { params }: PageProps): Promise<Metadata> {
  const { playlistId } = await params;
  const playlist = await fetchPlaylistForMetadata( {
    id: playlistId,
  } );
  const title: string = playlist?.name ?? "Playlist no encontrada";
  const songCount: number = playlist?.list?.length ?? 0;
  const description = `${songCount} ${songCount === 1 ? "canción" : "canciones"}`;
  const imageUrl: string = playlist?.imageCover
    ? getMediumCoverUrl(playlist.imageCover)
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
  const { playlistId } = await params;

  await redirectIfMediaPlayer( {
    url: backendUrl(
      PATH_ROUTES.musics.playlists.withParams(playlistId),
    ),
    searchParams,
  } );

  return <ClientPage params={params} />;
}
