import { PATH_ROUTES } from "$shared/routing";
import { SearchParams } from "next/dist/server/request/search-params";
import { assertIsDefined } from "$shared/utils/validation";
import { backendUrl } from "#modules/requests";
import { redirectIfMediaPlayer } from "#modules/utils/redirect-media-player";
import { ClientPage } from "../../../[smartPlaylistId]/ClientPage";

export type Params = {
  userSlug: string;
  smartPlaylistSlug: string;
};

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
  }

export default async function Page( { params, searchParams }: PageProps) {
  const { smartPlaylistSlug, userSlug } = (await params);

  assertIsDefined(userSlug);
  await redirectIfMediaPlayer( {
    url: backendUrl(
      PATH_ROUTES.musics.smartPlaylists.slug.withParams( {
        userSlug,
        smartPlaylistSlug,
      } ),
    ),
    searchParams,
  } );

  return <ClientPage params={params}/>;
}
