import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodesUpdateLastTimePlayedController } from "./controller";

testRoute(PATH_ROUTES.episodes.admin.updateLastTimePlayed.path);

verifyRoutesCoverage( {
  controller: EpisodesUpdateLastTimePlayedController,
  controllerRoute: PATH_ROUTES.episodes.path,
} );
