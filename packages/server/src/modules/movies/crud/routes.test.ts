import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, verifyRoutesCoverage } from "#core/routing/test";
import { MovieCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.movies.path, [
  "get",
  "create",
  "patch",
  "delete",
  "get-all",
  "get-many-criteria",
]);

verifyRoutesCoverage( {
  controller: MovieCrudController,
  controllerRoute: PATH_ROUTES.movies.path,
} );
