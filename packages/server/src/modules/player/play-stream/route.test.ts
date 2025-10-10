import { PATH_ROUTES } from "$shared/routing";
import { RequestMethod } from "@nestjs/common";
import { testRoute } from "#core/routing/test";

testRoute(PATH_ROUTES.player.play.stream.withParams("remotePlayerId", "id"));
testRoute(PATH_ROUTES.player.play.stream.withParams("remotePlayerId", "id"), {
  httpMethod: RequestMethod.POST,
} );
