import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { SearchDuplicatesController } from "./controller";

testRoute(PATH_ROUTES.musics.admin.searchDuplicates.path);

verifyRoutesCoverage( {
  controller: SearchDuplicatesController,
  controllerRoute: PATH_ROUTES.musics.admin.path,
} );
