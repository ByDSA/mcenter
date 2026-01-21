import { notFound, redirect } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { SearchParams } from "next/dist/server/request/search-params";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicsApi } from "#modules/musics/requests";
import { redirectIfMediaPlayer } from "#modules/utils/redirect-media-player";
import { backendUrl } from "#modules/requests";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<SearchParams>;
}
export default async function Page( { params, searchParams }: PageProps) {
  const { slug } = await params;

  await redirectIfMediaPlayer( {
    url: backendUrl(PATH_ROUTES.musics.slug.withParams(slug)),
    searchParams,
  } );
  const api = FetchApi.get(MusicsApi);
  const res = await api.getOneByCriteria( {
    skipCache: true, // Porque se ejecuta en backend
    filter: {
      slug,
    },
  } );
  const music = res.data;

  if (!music)
    return notFound();

  const query = new URLSearchParams(await searchParams as any).toString();

  redirect(`${PATH_ROUTES.musics.frontend.path}/${music.id}${query ? `?${query}` : ""}`);
}
