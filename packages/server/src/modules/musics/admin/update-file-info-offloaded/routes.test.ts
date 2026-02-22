import { PATH_ROUTES } from "$shared/routing";
import { MusicUpdateFileInfoOffloadedController } from "./controller";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";

testRoute(PATH_ROUTES.musics.admin.fileInfoUpdateOffloaded.path, {
  method: "GET",
  exactMatch: true,
} );
testRoute(PATH_ROUTES.musics.admin.fileInfoUpdateOffloaded.path, {
  method: "POST",
  exactMatch: true,
} );

verifyRoutesCoverage( {
  controller: MusicUpdateFileInfoOffloadedController,
  controllerRoute: PATH_ROUTES.musics.admin.path,
} );
