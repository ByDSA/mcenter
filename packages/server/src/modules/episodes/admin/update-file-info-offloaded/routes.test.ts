import { PATH_ROUTES } from "$shared/routing";
import { EpisodesUpdateFileInfoOffloadedController } from "./controller";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";

testRoute(PATH_ROUTES.episodes.admin.fileInfoUpdateOffloaded.path, {
  method: "GET",
  exactMatch: true,

} );
testRoute(PATH_ROUTES.episodes.admin.fileInfoUpdateOffloaded.path, {
  method: "POST",
  exactMatch: true,
} );

verifyRoutesCoverage( {
  controller: EpisodesUpdateFileInfoOffloadedController,
  controllerRoute: PATH_ROUTES.episodes.path,
} );
