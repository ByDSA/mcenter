import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { MusicFileInfoUploadController } from "../controller";

testRoute(PATH_ROUTES.musics.fileInfo.upload.path, {
  method: "POST",
} );
verifyRoutesCoverage( {
  controller: MusicFileInfoUploadController,
  controllerRoute: PATH_ROUTES.musics.fileInfo.upload.path,
} );
