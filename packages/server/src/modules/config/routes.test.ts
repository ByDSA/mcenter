import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { ConfigController } from "./config.controller";

testRoute(PATH_ROUTES.config.stop.path);
testRoute(PATH_ROUTES.config.resume.path);

verifyRoutesCoverage( {
  controller: ConfigController,
  controllerRoute: PATH_ROUTES.config.path,
} );
