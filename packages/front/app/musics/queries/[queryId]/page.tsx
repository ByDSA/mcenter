import { PATH_ROUTES } from "$shared/routing";
import { SearchParams } from "next/dist/server/request/search-params";
import { backendUrl } from "#modules/requests";
import { redirectIfMediaPlayer } from "#modules/utils/redirect-media-player";
import { ClientPage } from "./ClientPage";

export type Params = {
  queryId: string;
};

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

export default async function Page( { params, searchParams }: PageProps) {
  const { queryId } = (await params);

  await redirectIfMediaPlayer( {
    url: backendUrl(
      PATH_ROUTES.musics.queries.withParams(queryId),
    ),
    searchParams,
  } );

  return <ClientPage params={params} />;
}
