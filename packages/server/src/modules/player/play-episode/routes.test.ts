import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { PlayEpisodeController } from "./controller";

testRoute(
  PATH_ROUTES.player.play.episode.withParams( {
    remotePlayerId: "remotePlayerId",
    seriesKey: "seriesKey",
    episodeKey: "episodeKey",
  } ),
);
testRoute(
  PATH_ROUTES.player.play.episode.withParams( {
    remotePlayerId: "remotePlayerId",
    seriesKey: "seriesKey",
    episodeKey: "episodeKey",
  } ),
  {
    method: "POST",
  },
);

verifyRoutesCoverage( {
  controller: PlayEpisodeController,
  controllerRoute: PATH_ROUTES.player.path,
} );
