import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { PlayStreamController } from "./controller";

testRoute(PATH_ROUTES.player.play.stream.withParams("remotePlayerId", "id"));
testRoute(PATH_ROUTES.player.play.stream.withParams("remotePlayerId", "id"), {
  method: "POST",
} );

verifyRoutesCoverage( {
  controller: PlayStreamController,
  controllerRoute: PATH_ROUTES.player.path,
} );
