import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { PlayMusicController } from "./controller";

testRoute(PATH_ROUTES.player.play.music.withParams("remotePlayerId", "slug"));
testRoute(PATH_ROUTES.player.play.music.withParams("remotePlayerId", "slug"), {
  method: "POST",
} );

verifyRoutesCoverage( {
  controller: PlayMusicController,
  controllerRoute: PATH_ROUTES.player.path,
} );
