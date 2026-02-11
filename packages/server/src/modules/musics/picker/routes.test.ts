import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { MusicGetRandomController } from "./controller";

testRoute(PATH_ROUTES.musics.pickRandom.path);
testRoute(PATH_ROUTES.musics.pickRandom.withParams( {
  q: "query",
  token: "token",
  format: "m3u8",
} ));

verifyRoutesCoverage( {
  controller: MusicGetRandomController,
  controllerRoute: PATH_ROUTES.musics.pickRandom.path,
} );
