import { PATH_ROUTES } from "$shared/routing";
import { SearchParams } from "next/dist/server/request/search-params";
import { assertIsDefined } from "$shared/utils/validation";
import { backendUrl } from "#modules/requests";
import { redirectIfMediaPlayer } from "#modules/utils/redirect-media-player";
import { ClientPage } from "../../../[queryId]/ClientPage";

export type Params = {
  userSlug: string;
  querySlug: string;
};

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
  }

export default async function Page( { params, searchParams }: PageProps) {
  const { querySlug, userSlug } = (await params);

  assertIsDefined(userSlug);
  await redirectIfMediaPlayer( {
    url: backendUrl(
      PATH_ROUTES.musics.queries.slug.withParams( {
        userSlug,
        querySlug,
      } ),
    ),
    searchParams,
  } );

  return <ClientPage params={params}/>;
}
