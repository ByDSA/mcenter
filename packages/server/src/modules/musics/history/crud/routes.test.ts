import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, verifyRoutesCoverage } from "#core/routing/test";
import { MusicHistoryCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.musics.history.path, [
  "delete",
  "create",
  "get-many-criteria",
  "create-many",
]);

verifyRoutesCoverage( {
  controller: MusicHistoryCrudController,
  controllerRoute: PATH_ROUTES.musics.history.path,
} );
