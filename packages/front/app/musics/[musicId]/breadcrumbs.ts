import { PATH_ROUTES } from "$shared/routing";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { BreadcrumbRegistryEntry, GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";
import { matchesWithOneExtraSegment } from "#modules/ui-kit/Breadcrumbs/utils";
import { useMusic } from "#musics/hooks";

export const musicSingleBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> matchesWithOneExtraSegment(
    PATH_ROUTES.musics.frontend.path,
    segment,
  ) && mongoDbId.safeParse(segment.split("/").at(-1)).success,

  handler: async ( { segment } ) => {
    const musicId = segment.split("/").at(-1);
    const music = musicId ? await useMusic.get(musicId) : null;

    return {
      items: [
        {
          label: music?.title ?? "",
          href: PATH_ROUTES.musics.frontend.withParams( {
            id: music?.id ?? "",
          } ),
        },
      ],
      stopChain: false,
    } satisfies Awaited<ReturnType<GetBreadcrumb>>;
  },
};
