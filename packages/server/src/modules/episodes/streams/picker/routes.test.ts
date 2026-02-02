import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { StreamGetEpisodeController } from "./get-episode.controller";

testRoute(PATH_ROUTES.streams.picker.showPicker.withParams("streamKey"));
testRoute(PATH_ROUTES.streams.picker.getEpisode.withParams("streamKey"));

verifyRoutesCoverage( {
  controller: StreamGetEpisodeController,
  controllerRoute: PATH_ROUTES.streams.path,
} );
