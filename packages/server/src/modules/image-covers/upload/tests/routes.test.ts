import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { ImageCoverUploadController } from "../controller";

testRoute(PATH_ROUTES.imageCovers.upload.path, {
  method: "POST",
  exactMatch: true,
} );

verifyRoutesCoverage( {
  controller: ImageCoverUploadController,
  controllerRoute: PATH_ROUTES.imageCovers.upload.path,
} );
