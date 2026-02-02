import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { YoutubeImportMusicController } from "./controller";

testRoute(PATH_ROUTES.youtube.import.music.one.withParams("id"));
testRoute(PATH_ROUTES.youtube.import.music.playlist.withParams("id"));

verifyRoutesCoverage( {
  controller: YoutubeImportMusicController,
  controllerRoute: PATH_ROUTES.youtube.import.music.path,
} );
