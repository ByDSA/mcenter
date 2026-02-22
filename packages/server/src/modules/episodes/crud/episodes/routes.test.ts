import { PATH_ROUTES } from "$shared/routing";
import { EpisodesCrudController } from "./controller";
import { testCrudRoutes, verifyRoutesCoverage } from "#core/routing/test";

testCrudRoutes(PATH_ROUTES.episodes.path, [
  "get",
  "create",
  "patch",
  "delete",
  "get-one-criteria",
  "get-many-criteria",
]);

verifyRoutesCoverage( {
  controller: EpisodesCrudController,
  controllerRoute: PATH_ROUTES.episodes.path,
} );
