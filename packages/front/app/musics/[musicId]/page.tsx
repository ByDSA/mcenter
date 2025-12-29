import { PATH_ROUTES } from "$shared/routing";
import { SearchParams } from "next/dist/server/request/search-params";
import { backendUrl } from "#modules/requests";
import { redirectIfMediaPlayer } from "#modules/utils/redirect-media-player";
import { ClientPage } from "./ClientPage";

export type Params = {
  musicId: string;
};

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

export default async function Page( { params, searchParams }: PageProps) {
  const { musicId } = (await params);

  await redirectIfMediaPlayer( {
    url: backendUrl(
      PATH_ROUTES.musics.withParams(musicId),
    ),
    searchParams,
  } );

  return <ClientPage params={params}/>;
}
