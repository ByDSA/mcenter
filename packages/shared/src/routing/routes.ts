import { PathRoutes } from "./routes.types";

const MUSICS = "/api/musics";
const PLAYER = "/api/player";
const EPISODES = "/api/episodes";
const PLAYER_PLAY_EPISODE = `${PLAYER}/play/episode`;
const PLAYER_PLAY_STREAM = `${PLAYER}/play/stream`;
const MUSICS_HISTORY = MUSICS + "/history";
const EPISODES_HISTORY = EPISODES + "/history";
const EPISODES_ACTIONS = EPISODES + "/actions";

export const PATH_ROUTES = {
  musics: {
    path: MUSICS,
    withParams: (id: string)=>`${MUSICS}/${id}`,
    history: {
      path: MUSICS_HISTORY,
      withParams: (id: string) => `${MUSICS_HISTORY}/${id}`,
      search: {
        path: MUSICS_HISTORY + "/search",
      },
    },
    raw: {
      withParams: (musicUrl: string) => `${MUSICS}/get/raw/${musicUrl}`,
    },
  },
  actions: {
    path: "/api/actions",
    fixer: {
      path: "/api/actions/fixer",
    },
    log: {
      path: "/api/actions/log",
    },
  },
  episodes: {
    path: EPISODES,
    withParams: (serieId: string, code: string) => `${EPISODES}/${serieId}/${code}`,
    search: {
      path: "/api/episodes/search",
    },
    history: {
      path: EPISODES_HISTORY,
      entries: {
        withParams: (entryId: string) => `${EPISODES_HISTORY}/entries/${entryId}`,
        search: {
          path: EPISODES_HISTORY + "/entries/search",
        },
      },
    },
    actions: {
      updateLastTimePlayed: {
        path: EPISODES_ACTIONS + "/update-last-time-played",
      },
      fileInfoUpdateSaved: {
        path: EPISODES_ACTIONS + "/file-info/update/saved",
      },
      addNewFiles: {
        path: EPISODES_ACTIONS + "/add-new-files",
      },
    },
    picker: {
      path: "/api/picker",
    },
  },
  streams: {
    path: "/api/streams",
    search: {
      path: "/api/streams/criteria",
    },
  },
  player: {
    path: PLAYER,
    play: {
      episode: {
        path: PLAYER_PLAY_EPISODE,
        withParams: (serieId: string, episodeId: string) => `${PLAYER_PLAY_EPISODE}/${serieId}/${episodeId}`,
      },
      stream: {
        path: PLAYER_PLAY_STREAM,
        withParams: (streamId: string) => `${PLAYER_PLAY_STREAM}/${streamId}`,
      },
    },
  },
} satisfies PathRoutes;
