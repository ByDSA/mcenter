import { PATH_ROUTES } from "$shared/routing";
import { RequestMethod } from "@nestjs/common";
import { testRoute } from "#core/routing/test";

testRoute(PATH_ROUTES.musics.admin.searchDuplicates.path, {
  httpMethod: RequestMethod.GET,
} );
