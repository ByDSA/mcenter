import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test/routing";
import { SmartPlaylistCrudController } from "./controller";

testCrudRoutes(PATH_ROUTES.musics.smartPlaylists.path, [
  "get",
  "create",
  "patch",
  "delete",
  "get-one-criteria",
  "get-many-criteria",
]);
testRoute(PATH_ROUTES.musics.smartPlaylists.slug.withParams( {
  userSlug: "userSlug",
  smartPlaylistSlug: "querySlug",
} ));
verifyRoutesCoverage( {
  controller: SmartPlaylistCrudController,
  controllerRoute: PATH_ROUTES.musics.smartPlaylists.path,
} );
