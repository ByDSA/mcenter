import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { StreamGetEpisodeController } from "./controller";

testRoute(PATH_ROUTES.streams.picker.getEpisode.withParams("streamKey"));

verifyRoutesCoverage( {
  controller: StreamGetEpisodeController,
  controllerRoute: PATH_ROUTES.streams.path,
} );
