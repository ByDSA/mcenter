import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { UsersMusicController } from "./controller";

testRoute(PATH_ROUTES.users.favoritePlaylist.path, {
  method: "PATCH",
  exactMatch: true,
} );
verifyRoutesCoverage( {
  controller: UsersMusicController,
  controllerRoute: PATH_ROUTES.users.path,
} );
