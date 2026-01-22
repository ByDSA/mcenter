import { UserPayload } from "$shared/models/auth";
import { PATH_ROUTES } from "$shared/routing";

export const getMusicMainUrl = (user: UserPayload | null) => {
  return user ? PATH_ROUTES.musics.frontend.playlists.path : "/musics/search";
};
