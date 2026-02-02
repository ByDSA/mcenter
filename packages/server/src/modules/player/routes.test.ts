import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { RemotePlayersController } from "./remote-players.controller";

testRoute(PATH_ROUTES.player.remotePlayers.path);
testRoute(PATH_ROUTES.player.remotePlayers.stream.path, {
  method: "GET",
  exactMatch: true,
} );
verifyRoutesCoverage( {
  controller: RemotePlayersController,
  controllerRoute: PATH_ROUTES.player.path,
} );
