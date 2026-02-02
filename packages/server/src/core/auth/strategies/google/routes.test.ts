import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { GoogleController } from "./controller";

testRoute(PATH_ROUTES.auth.google.login.path);
testRoute(PATH_ROUTES.auth.google.redirect.path);

verifyRoutesCoverage( {
  controller: GoogleController,
  controllerRoute: PATH_ROUTES.auth.path,
} );
