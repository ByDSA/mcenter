import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodesCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.episodes.path, [
  "get",
  "create",
  "patch",
  "delete",
  "get-many-criteria",
]);

verifyRoutesCoverage( {
  controller: EpisodesCrudController,
  controllerRoute: PATH_ROUTES.episodes.path,
} );
