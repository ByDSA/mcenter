import { PATH_ROUTES } from "$shared/routing";
import { testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { MusicUsersListsController } from "./controller";

testRoute(PATH_ROUTES.musics.usersLists.myLists.path, {
  method: "POST",
  exactMatch: true,
} );
testRoute(PATH_ROUTES.musics.usersLists.path, {
  method: "PATCH",
  exactMatch: true,
} );
testRoute(PATH_ROUTES.musics.usersLists.move.path, {
  method: "PATCH",
  exactMatch: true,
} );
verifyRoutesCoverage( {
  controller: MusicUsersListsController,
  controllerRoute: PATH_ROUTES.musics.usersLists.path,
} );
