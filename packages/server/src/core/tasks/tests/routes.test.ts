import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { TaskController } from "../controller";

testRoute(PATH_ROUTES.tasks.status.withParams("id"));
testRoute(PATH_ROUTES.tasks.status.stream.withParams("id"));
testRoute(PATH_ROUTES.tasks.queue.status.withParams("name"));
testRoute(PATH_ROUTES.tasks.queue.ids.withParams("name"));

verifyRoutesCoverage( {
  controller: TaskController,
  controllerRoute: PATH_ROUTES.tasks.path,
} );
