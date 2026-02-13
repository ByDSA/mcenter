import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { StreamPickerController } from "./controller";

testRoute(PATH_ROUTES.streams.picker.showPicker.withParams("streamKey"));

verifyRoutesCoverage( {
  controller: StreamPickerController,
  controllerRoute: PATH_ROUTES.streams.path,
} );
