import { PATH_ROUTES } from "$shared/routing";
import { testRoute } from "#core/routing/test";

testRoute(PATH_ROUTES.player.play.music.withParams("remotePlayerId", "slug"));
