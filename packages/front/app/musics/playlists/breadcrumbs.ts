import { PATH_ROUTES } from "$shared/routing";
import { BreadcrumbRegistryEntry, GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";

export const musicListsBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> segment === PATH_ROUTES.musics.frontend.playlists.path
    || segment === PATH_ROUTES.musics.frontend.smartPlaylists.path,
  // eslint-disable-next-line require-await
  handler: async () => {
    return {
      items: [
        {
          label: "Listas",
          href: PATH_ROUTES.musics.frontend.playlists.path,
        },
      ],
      stopChain: false,
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};
