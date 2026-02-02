import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { MusicGetRandomController } from "./controller";

testRoute(PATH_ROUTES.musics.pickRandom.path);

verifyRoutesCoverage( {
  controller: MusicGetRandomController,
  controllerRoute: PATH_ROUTES.musics.pickRandom.path,
} );
