import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, verifyRoutesCoverage } from "#core/routing/test";
import { MovieFileInfoController } from "./controller";

testCrudRoutes(PATH_ROUTES.movies.fileInfo.path, [
  "get-many-criteria",
  "patch",
  "delete",
]);

verifyRoutesCoverage( {
  controller: MovieFileInfoController,
  controllerRoute: PATH_ROUTES.movies.fileInfo.path,
} );
