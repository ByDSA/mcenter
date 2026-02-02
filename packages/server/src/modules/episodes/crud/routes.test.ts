import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodesCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.episodes.path, [
  "get",
  "create",
  "patch",
  "delete",
  "get-many-criteria",
]);

testRoute(PATH_ROUTES.episodes.userInfo.withParams("id"), {
  method: "PATCH",
} );

verifyRoutesCoverage( {
  controller: EpisodesCrudController,
  controllerRoute: PATH_ROUTES.episodes.path,
} );
