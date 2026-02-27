import { PATH_ROUTES } from "$shared/routing";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { BreadcrumbRegistryEntry, GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";
import { matchesWithOneExtraSegment } from "#modules/ui-kit/Breadcrumbs/utils";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "#musics/lists/playlists/requests";

export const musicPlaylistBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> matchesWithOneExtraSegment(
    PATH_ROUTES.musics.frontend.playlists.path,
    segment,
  ) && mongoDbId.safeParse(segment.split("/").at(-1)).success,

  handler: async ( { segment } ) => {
    const playlistId = segment.split("/").at(-1);

    if (!playlistId) {
      return {
        items: [],
      };
    }

    const api = FetchApi.get(MusicPlaylistsApi);
    const res = playlistId
      ? await api.getOneByCriteria( {
        filter: {
          id: playlistId,
        },
      } )
      : null;
    const playlist = res?.data ?? null;

    return {
      items: [
        {
          label: playlist?.name ?? "",
          href: PATH_ROUTES.musics.frontend.playlists.withParams( {
            playlistId,
          } ),
        },
      ],
      stopChain: false,
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};
