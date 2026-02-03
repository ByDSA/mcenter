import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, verifyRoutesCoverage } from "#core/routing/test/routing";
import { ImageCoverCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.imageCovers.path, [
  "get",
  "patch",
  "delete",
  "get-one-criteria",
  "get-many-criteria",
]);


verifyRoutesCoverage( {
  controller: ImageCoverCrudController,
  controllerRoute: PATH_ROUTES.imageCovers.path,
} );
