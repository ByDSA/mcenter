import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodesSlugController } from "./controller";

testRoute(PATH_ROUTES.episodes.slug.withParams("seriesKey", "episodeKey"));

verifyRoutesCoverage( {
  controller: EpisodesSlugController,
  controllerRoute: PATH_ROUTES.episodes.slug.path,
} );
