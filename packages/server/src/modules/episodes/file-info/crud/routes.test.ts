import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodeFileInfosCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.episodes.fileInfo.path, [
  "patch",
]);

verifyRoutesCoverage( {
  controller: EpisodeFileInfosCrudController,
  controllerRoute: PATH_ROUTES.episodes.fileInfo.path,
} );
