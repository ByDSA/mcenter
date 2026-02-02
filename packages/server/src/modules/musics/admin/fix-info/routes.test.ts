import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { MusicFixInfoController } from "./fix-info.controller";

testRoute(PATH_ROUTES.musics.admin.fixInfo.path);

verifyRoutesCoverage( {
  controller: MusicFixInfoController,
  controllerRoute: PATH_ROUTES.musics.admin.path,
} );
