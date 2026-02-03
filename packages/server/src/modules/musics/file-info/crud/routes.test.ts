import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, verifyRoutesCoverage } from "#core/routing/test/routing";
import { MusicFileInfoController } from "./controller";

testCrudRoutes(PATH_ROUTES.musics.fileInfo.path, [
  "delete",
  "get-many-criteria",
]);
verifyRoutesCoverage( {
  controller: MusicFileInfoController,
  controllerRoute: PATH_ROUTES.musics.fileInfo.path,
} );
