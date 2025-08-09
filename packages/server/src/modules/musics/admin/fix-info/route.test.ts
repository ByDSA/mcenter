import { PATH_ROUTES } from "$shared/routing";
import { RequestMethod } from "@nestjs/common";
import { testRoute } from "#core/routing/test";

testRoute(PATH_ROUTES.musics.path + "/admin", {
  httpMethod: RequestMethod.GET,
} );
