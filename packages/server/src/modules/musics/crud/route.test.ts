import { PATH_ROUTES } from "$shared/routing";
import { testRoute } from "#core/routing/test/routing";

testRoute(PATH_ROUTES.musics.withParams("id"));
testRoute(PATH_ROUTES.musics.search.path);
