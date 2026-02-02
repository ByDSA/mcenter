import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { MusicUpdateFileInfoController } from "./controller";

testRoute(PATH_ROUTES.musics.admin.updateFileInfos.path);

verifyRoutesCoverage( {
  controller: MusicUpdateFileInfoController,
  controllerRoute: PATH_ROUTES.musics.admin.path,
} );
