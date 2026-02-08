import { PATH_ROUTES } from "$shared/routing";
import { EpisodeFileInfosUploadController } from "../controller";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";

testRoute(PATH_ROUTES.episodes.fileInfo.upload.path, {
  method: "POST",
} );

verifyRoutesCoverage( {
  controller: EpisodeFileInfosUploadController,
  controllerRoute: PATH_ROUTES.episodes.fileInfo.upload.path,
} );
