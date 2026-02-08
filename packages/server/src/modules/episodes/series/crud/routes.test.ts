import { PATH_ROUTES } from "$shared/routing";
import { SeriesCrudController } from "./controller";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test";

testCrudRoutes(PATH_ROUTES.episodes.series.path, [
  "get",
  "create",
  "patch",
  "delete",
  "get-all",
  "get-many-criteria",
]);

testRoute(PATH_ROUTES.episodes.series.seasons.withParams("id"));

verifyRoutesCoverage( {
  controller: SeriesCrudController,
  controllerRoute: PATH_ROUTES.episodes.series.path,
} );
