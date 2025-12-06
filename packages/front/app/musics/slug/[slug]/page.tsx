import { notFound } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { SearchParams } from "next/dist/server/request/search-params";
import { backendUrl } from "#modules/requests";
import { redirectIfMediaPlayer } from "#modules/utils/redirect-media-player";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export default async function Page( { params, searchParams }: PageProps) {
  await redirectIfMediaPlayer( {
    url: backendUrl(
      PATH_ROUTES.musics.slug.withParams((await params).slug),
    ),
    searchParams,
  } );

  return notFound();
}
