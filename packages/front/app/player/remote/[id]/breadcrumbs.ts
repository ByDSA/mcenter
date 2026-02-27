import type { BreadcrumbRegistryEntry } from "#modules/ui-kit/Breadcrumbs/types";
import { PATH_ROUTES } from "$shared/routing";
import { RemotePlayerDtos } from "$shared/models/player/remote-player/dto/domain";
import { backendUrl } from "#modules/requests";
import { GetBreadcrumb } from "#modules/ui-kit/Breadcrumbs/types";
import { matchesWithOneExtraSegment } from "#modules/ui-kit/Breadcrumbs/utils";

const getRemotePlayerBreadcrumbs: GetBreadcrumb = (async ( { segment } ) => {
  const playerId = segment.split("/").at(-1);
  const data = await (await fetch(backendUrl(PATH_ROUTES.player.remotePlayers.path), {
    credentials: "include",
  } )).json() as RemotePlayerDtos.Front.Dto[];
  const player = data.find(p=>p.id === playerId);
  const playerName = player?.publicName;

  return {
    items: [{
      label: playerName ?? "",
    },
    ],
    stopChain: false,
  } satisfies Awaited<ReturnType<GetBreadcrumb>>;
} );

export const playerRemoteBreadcrumbsEntry: BreadcrumbRegistryEntry = {
  matcher: ( { segment } )=> matchesWithOneExtraSegment(
    "/player/remote",
    segment,
  ),
  handler: getRemotePlayerBreadcrumbs,
};
