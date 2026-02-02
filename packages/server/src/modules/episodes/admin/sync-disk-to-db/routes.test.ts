import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodesSyncDiskToDatabaseController } from "./controller";

testRoute(PATH_ROUTES.episodes.admin.addNewFiles.path, {
  exactMatch: true,
} );

verifyRoutesCoverage( {
  controller: EpisodesSyncDiskToDatabaseController,
  controllerRoute: PATH_ROUTES.episodes.path,
} );
