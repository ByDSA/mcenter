const USERS = "/api/users";

export const usersRoutes = {
  path: USERS,
  favoritePlaylist: {
    path: `${USERS}/musics/favorite-playlist`,
  },
};
