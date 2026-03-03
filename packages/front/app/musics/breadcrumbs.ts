import { PATH_ROUTES } from "$shared/routing";
import { BreadcrumbRegistryEntry, GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";

export const musicRootBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> segment === PATH_ROUTES.musics.frontend.path,
  // eslint-disable-next-line require-await
  handler: async ( { LL } ) => {
    return {
      items: [
        {
          label: LL.main.menu.music(),
          href: PATH_ROUTES.musics.frontend.path,
        },
      ],
      stopChain: false,
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};
