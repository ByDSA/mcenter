import { PATH_ROUTES } from "$shared/routing";
import { BreadcrumbRegistryEntry, GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";
import { matchesWithOneExtraSegment } from "#modules/ui-kit/Breadcrumbs/utils";
import { useSeries } from "#episodes/series/hooks";
import { useEpisode } from "#episodes/hooks";

export const episodeBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> matchesWithOneExtraSegment(
    PATH_ROUTES.episodes.frontend.lists.episode.path,
    segment,
  ) || segment === PATH_ROUTES.episodes.frontend.lists.episode.path,
  handler: async ( { pathname, segment } ) => {
    if (segment === PATH_ROUTES.episodes.frontend.lists.episode.path) {
      return {
        items: [],
      };
    }

    // pathname = /series/episodes/:id
    const episodeId = pathname.split("/").at(-1);
    const episode = episodeId ? await useEpisode.get(episodeId) : null;
    const series = episode ? await useSeries.get(episode.seriesId) : null;

    return {
      items: [
        {
          label: series?.name ?? "",
          href: PATH_ROUTES.episodes.frontend.lists.withParams( {
            serieId: series?.id ?? "",
          } ),
        }, {
          label: episode?.episodeKey ?? "",
        },
      ],
      stopChain: false,
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};
