import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { FixerController } from "./fixer.controller";

testRoute(PATH_ROUTES.streams.fixer.path);

verifyRoutesCoverage( {
  controller: FixerController,
  controllerRoute: PATH_ROUTES.streams.path,
} );
