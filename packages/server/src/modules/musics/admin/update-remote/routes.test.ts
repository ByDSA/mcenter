import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { MusicUpdateRemoteController } from "./controller";

testRoute(PATH_ROUTES.musics.admin.updateRemote.path);

verifyRoutesCoverage( {
  controller: MusicUpdateRemoteController,
  controllerRoute: PATH_ROUTES.musics.admin.path,
} );
