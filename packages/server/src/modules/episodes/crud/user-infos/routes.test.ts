import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { EpisodesUserInfoCrudController } from "./controller";

testRoute(PATH_ROUTES.episodes.userInfo.withParams("episodeId"), {
  method: "PATCH",
})


verifyRoutesCoverage( {
  controller: EpisodesUserInfoCrudController,
  controllerRoute: PATH_ROUTES.episodes.path,
} );
