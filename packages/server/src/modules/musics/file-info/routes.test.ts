import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { MusicFileInfoController } from "./controller";

testCrudRoutes(PATH_ROUTES.musics.fileInfo.path, [
  "delete",
  "get-many-criteria",
]);
testRoute(PATH_ROUTES.musics.fileInfo.upload.path, {
  method: "POST",
} );
verifyRoutesCoverage( {
  controller: MusicFileInfoController,
  controllerRoute: PATH_ROUTES.musics.fileInfo.path,
} );
