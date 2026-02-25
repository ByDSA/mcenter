import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { TaskController } from "../controller";

testRoute(PATH_ROUTES.tasks.status.withParams("id"), {
  method: "GET",
} );
testRoute(PATH_ROUTES.tasks.statusStream.withParams("id"), {
  method: "GET",
} );
testRoute(PATH_ROUTES.tasks.queue.ids.withParams("name"), {
  method: "GET",
} );
testRoute(PATH_ROUTES.tasks.queue.status.withParams("name"), {
  method: "GET",
} );
testRoute(PATH_ROUTES.tasks.pause.withParams("id"), {
  method: "POST",
} );
testRoute(PATH_ROUTES.tasks.resume.withParams("id"), {
  method: "POST",
} );
testRoute(PATH_ROUTES.tasks.kill.withParams("id"), {
  method: "POST",
} );
verifyRoutesCoverage( {
  controller: TaskController,
  controllerRoute: PATH_ROUTES.tasks.path,
} );
