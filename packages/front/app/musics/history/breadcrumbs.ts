import { PATH_ROUTES } from "$shared/routing";
import { BreadcrumbRegistryEntry, GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";

export const musicHistoryBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> segment === PATH_ROUTES.musics.frontend.history.path,
  // eslint-disable-next-line require-await
  handler: async () => {
    return {
      items: [
        {
          label: "Historial",
        },
      ],
      stopChain: false,
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};
