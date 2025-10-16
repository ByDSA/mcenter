import { RequestMethod } from "@nestjs/common";
import { PATH_ROUTES } from "$shared/routing";
import { testRoute } from "#core/routing/test";

describe("global routes", () => {
  testRoute(PATH_ROUTES.musics.history.search.path, {
    httpMethod: RequestMethod.POST,
  } );
  testRoute(PATH_ROUTES.musics.history.withParams("id"), {
    httpMethod: RequestMethod.DELETE,
  } );
} );
