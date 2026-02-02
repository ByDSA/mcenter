import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { AuthPassController } from "./controller";

testRoute(PATH_ROUTES.auth.local.login.path, {
  method: "POST",
  exactMatch: true,
} );
testRoute(PATH_ROUTES.auth.local.signup.path, {
  method: "POST",
  exactMatch: true,
} );
testRoute(PATH_ROUTES.auth.local.emailVerification.resend.path, {
  method: "POST",
  exactMatch: true,
} );
testRoute(PATH_ROUTES.auth.local.emailVerification.verify.path, {
  method: "POST",
  exactMatch: true,
} );

verifyRoutesCoverage( {
  controller: AuthPassController,
  controllerRoute: PATH_ROUTES.auth.path,
} );
