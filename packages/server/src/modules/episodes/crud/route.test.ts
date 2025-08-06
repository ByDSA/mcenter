import { PATH_ROUTES } from "$shared/routing";
import { RequestMethod } from "@nestjs/common";
import { testRoute } from "#core/routing/test";

testRoute(PATH_ROUTES.episodes.search.path, {
  httpMethod: RequestMethod.POST,
} );
