import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodesUpdateController } from "./controller";

testRoute(PATH_ROUTES.episodes.admin.fileInfoUpdateSaved.path);

verifyRoutesCoverage( {
  controller: EpisodesUpdateController,
  controllerRoute: PATH_ROUTES.episodes.path,
} );
