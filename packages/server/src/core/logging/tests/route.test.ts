import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { LoggingController } from "../controller";

testRoute(PATH_ROUTES.logs.path);

verifyRoutesCoverage( {
  controller: LoggingController,
  controllerRoute: PATH_ROUTES.logs.path,
} );
