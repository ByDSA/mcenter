import { PATH_ROUTES } from "$shared/routing";
import { EpisodeDependenciesCrudController } from "./controller";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test";

testCrudRoutes(PATH_ROUTES.episodes.dependencies.path, [
  "get-all",
  "get-many-criteria",
  "delete",
]);
testRoute(PATH_ROUTES.episodes.dependencies.withParams("lastEpisodeId")); // getNext

verifyRoutesCoverage( {
  controller: EpisodeDependenciesCrudController,
  controllerRoute: PATH_ROUTES.episodes.dependencies.path,
} );
