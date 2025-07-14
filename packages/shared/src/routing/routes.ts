import { PathRoutes } from "./routes.types";

const MUSICS = "/api/musics";
const PLAYER = "/api/player";
const EPISODES = "/api/episodes";
const PLAYER_PLAY_EPISODE = `${PLAYER}/play/episode`;
const PLAYER_PLAY_STREAM = `${PLAYER}/play/stream`;
const MUSICS_HISTORY = MUSICS + "/history";

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
    episodes: {
      updateLastTimePlayed: {
        path: "/api/actions/episodes/updateLastTimePlayed",
      },
      fileInfoUpdateSaved: {
        path: "/api/actions/episodes/file-info/update/saved",
      },
      addNewFiles: {
        path: "/api/actions/episodes/add-new-files",
      },
      fixer: {
        path: "/api/actions/fixer",
      },
      log: {
        path: "/api/actions/episodes/log",
      },
    },
  },
  episodes: {
    path: EPISODES,
    withParams: (serieId: string, innerId: string) => `${EPISODES}/${serieId}/${innerId}`,
    search: {
      path: "/api/episodes/search",
    },
    history: {
      path: "/api/history-list",
      entries: {
        withParams: (listId: string, entryId: string) => `/api/history-list/${listId}/entries/${entryId}`,
        search: {
          path: "/api/history-list/entries/search",
        },
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
