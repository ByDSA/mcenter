import { PATH_ROUTES } from "$shared/routing";
import { type BreadcrumbRegistryEntry } from "#modules/ui-kit/Breadcrumbs/types";
import { GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";
import { matchesWithOneExtraSegment } from "#modules/ui-kit/Breadcrumbs/utils";
import { useSeries } from "#episodes/series/hooks";

export const seriesRootBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=>segment === "/series"
      || segment === PATH_ROUTES.episodes.frontend.lists.path,
  // eslint-disable-next-line require-await
  handler: async ( { segment } ) => {
    if (segment === PATH_ROUTES.episodes.frontend.lists.path) {
      return {
        items: [],
      };
    }

    return {
      items: [{
        label: "Series",
        href: PATH_ROUTES.episodes.frontend.lists.path,
      },
      ],
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};

export const seriesBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> matchesWithOneExtraSegment(
    PATH_ROUTES.episodes.frontend.lists.path,
    segment,
  ),
  handler: async ( { pathname } ) => {
    const serieId = pathname.split("/").at(-1);
    const series = serieId ? await useSeries.get(serieId) : null;

    return {
      items: [{
        label: series?.name ?? "",
      },
      ],
      stopChain: false,
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};
