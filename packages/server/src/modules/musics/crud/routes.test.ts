import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { MusicCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.musics.path, [
  "get",
  "patch",
  "delete",
  "get-one-criteria",
  "get-many-criteria",
]);
testRoute(PATH_ROUTES.musics.userInfo.withParams("id"), {
  method: "PATCH",
} );
verifyRoutesCoverage( {
  controller: MusicCrudController,
  controllerRoute: PATH_ROUTES.musics.path,
} );
