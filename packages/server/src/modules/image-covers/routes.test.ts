import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { ImageCoverCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.imageCovers.path, [
  "get",
  "patch",
  "delete",
  "get-one-criteria",
  "get-many-criteria",
]);

testRoute(PATH_ROUTES.imageCovers.upload.path, {
  method: "POST",
  exactMatch: true,
} );

verifyRoutesCoverage( {
  controller: ImageCoverCrudController,
  controllerRoute: PATH_ROUTES.imageCovers.path,
} );
