import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodeDependenciesCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.episodes.dependencies.path, [
  "get-all",
  "get-many-criteria",
  "delete",
]);
testRoute(PATH_ROUTES.episodes.dependencies.withParams("serieKey", "episodeKey")); // getNext

verifyRoutesCoverage( {
  controller: EpisodeDependenciesCrudController,
  controllerRoute: PATH_ROUTES.episodes.dependencies.path,
} );
