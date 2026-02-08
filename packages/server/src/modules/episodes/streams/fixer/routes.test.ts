import { PATH_ROUTES } from "$shared/routing";
import { FixerController } from "./controller";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";

testRoute(PATH_ROUTES.streams.fixer.path);

verifyRoutesCoverage( {
  controller: FixerController,
  controllerRoute: PATH_ROUTES.streams.fixer.path,
} );
