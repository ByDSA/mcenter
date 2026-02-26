import { usersRoutes } from "../models/auth/users.routes";
import { tasksRoutes } from "../models/tasks/routes";
import { authRoutes } from "../models/auth/routes";
import { musicsRoutes } from "../models/musics/routes";
import { episodesRoutes } from "../models/episodes/routes";
import { moviesRoutes } from "../models/movies/routes";
import { imageCoversRoutes } from "../models/image-covers/routes";
import { playerRoutes } from "../models/player/routes";
import { youtubeRoutes } from "../models/youtube/routes";
import { streamsRoutes } from "../models/episodes/streams/routes";
import { configRoutes } from "./config.routes";
import { testsRoutes } from "./test.routes";
import { logsRoutes } from "./logs.routes";
import { PathRoutes } from "./routes.types";

export const PATH_ROUTES = {
  config: configRoutes,
  users: usersRoutes,
  tests: testsRoutes,
  auth: authRoutes,
  tasks: tasksRoutes,
  youtube: youtubeRoutes,
  imageCovers: imageCoversRoutes,
  musics: musicsRoutes,
  movies: moviesRoutes,
  logs: logsRoutes,
  episodes: episodesRoutes,
  streams: streamsRoutes,
  player: playerRoutes,
} satisfies PathRoutes;
