import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { MusicsSlugController } from "./controller";

testRoute(PATH_ROUTES.musics.slug.withParams("id"));
verifyRoutesCoverage( {
  controller: MusicsSlugController,
  controllerRoute: PATH_ROUTES.musics.slug.path,
} );
