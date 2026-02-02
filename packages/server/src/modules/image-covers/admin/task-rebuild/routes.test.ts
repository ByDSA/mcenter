import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { ImageCoversRebuildAllController } from "./controller";

testRoute(PATH_ROUTES.imageCovers.admin.rebuildAll.path, {
  exactMatch: true,
} );

verifyRoutesCoverage( {
  controller: ImageCoversRebuildAllController,
  controllerRoute: PATH_ROUTES.imageCovers.admin.path,
} );
