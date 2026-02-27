import { PATH_ROUTES } from "$shared/routing";
import { BreadcrumbRegistryEntry, GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";

export const musicRootBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> segment === PATH_ROUTES.musics.frontend.path,
  // eslint-disable-next-line require-await
  handler: async () => {
    return {
      items: [
        {
          label: "Música",
          href: PATH_ROUTES.musics.frontend.path,
        },
      ],
      stopChain: false,
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};
