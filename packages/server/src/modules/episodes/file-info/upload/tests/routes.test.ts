import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodeFileInfosUploadController } from "../controller";

testRoute(PATH_ROUTES.episodes.fileInfo.upload.path, {
  method: "POST",
} );

verifyRoutesCoverage( {
  controller: EpisodeFileInfosUploadController,
  controllerRoute: PATH_ROUTES.episodes.fileInfo.upload.path,
} );
