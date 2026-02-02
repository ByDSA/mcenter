import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { AuthController } from "./controller";

testRoute(PATH_ROUTES.auth.path + "/logout");

verifyRoutesCoverage( {
  controller: AuthController,
  controllerRoute: PATH_ROUTES.auth.path,
} );
