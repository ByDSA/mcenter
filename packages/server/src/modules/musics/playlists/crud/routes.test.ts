import { PATH_ROUTES } from "$shared/routing";
import { testCrudRoutes, testRoute, verifyRoutesCoverage } from "#core/routing/test";
import { MusicPlaylistsController } from "./controller";

testCrudRoutes(PATH_ROUTES.musics.playlists.path, [
  "get",
  "get-one-criteria",
  "patch",
  "create",
  "delete",
  "get-many-criteria",
]);
testRoute(PATH_ROUTES.musics.playlists.track.addTrack.withParams("playlistId"), {
  method: "POST",
} );
testRoute(PATH_ROUTES.musics.playlists.track.removeManyTracks.withParams("playlistId"), {
  method: "DELETE",
} );

testRoute(PATH_ROUTES.musics.playlists.getManyByUser.withParams("userId"), {
  method: "POST",
} );
testRoute(PATH_ROUTES.musics.playlists.track.index.withParams("id", 1));
testRoute(PATH_ROUTES.musics.playlists.track.move.withParams("id", "itemId", 1));
testRoute(PATH_ROUTES.musics.playlists.slug.withParams( {
  userSlug: "userSlug",
  playlistSlug: "playlistSlug",
} ));
testRoute(PATH_ROUTES.musics.playlists.slug.withParams( {
  userSlug: "userSlug",
  playlistSlug: "playlistSlug",
  trackNumber: 1,
} ));

verifyRoutesCoverage( {
  controller: MusicPlaylistsController,
  controllerRoute: PATH_ROUTES.musics.playlists.path,
} );
