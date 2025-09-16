import { ResponseFormat } from "../models/resources";
import { EpisodeCompKey } from "../models/episodes";
import { PathRoutes } from "./routes.types";

const TASKS = "/api/tasks";
const YOUTUBE = "/api/youtube";
const MUSICS = "/api/musics";
const MUSICS_SLUG = `${MUSICS}/slug`;
const MUSICS_PLAYLISTS = `${MUSICS}/playlists`;
const MUSICS_RANDOM = `${MUSICS}/random`;
const MUSICS_ADMIN = `${MUSICS}/admin`;
const MUSICS_FILE_INFO = MUSICS + "/file-info";
const PLAYER = "/api/player";
const EPISODES = "/api/episodes";
const EPISODES_SLUG = `${EPISODES}/slug`;
const PLAYER_PLAY_EPISODE = `${PLAYER}/play/episode`;
const PLAYER_PLAY_MUSIC = `${PLAYER}/play/music`;
const PLAYER_PLAY_STREAM = `${PLAYER}/play/stream`;
const MUSICS_HISTORY = MUSICS + "/history";
const EPISODES_HISTORY = EPISODES + "/history";
const EPISODES_FILE_INFO = EPISODES + "/file-info";
const EPISODES_DEPENDENCIES = EPISODES + "/dependencies";
const EPISODES_ADMIN = EPISODES + "/admin";

type MusicSlugQueryParams = {
  format?: ResponseFormat;
};

export const PATH_ROUTES = {
  tasks: {
    path: TASKS,
    withParams: (id: string) => `${TASKS}/${id}`,
    status: {
      withParams: (id: string) => `${TASKS}/${id}/status`,
    },
    queue: {
      status: {
        withParams: (queue: string, n?: number) => `${TASKS}/queue/${queue}/status${n ? `?n=${n}` : ""}`,
      },
      ids: {
        withParams: (queue: string, n?: number) => `${TASKS}/queue/${queue}/ids/${n ? `?n=${n}` : ""}`,
      },
    },
    statusStream: {
      withParams: (id: string, heartbeatEveryMs?: number) => `${TASKS}/${id}/status/stream${heartbeatEveryMs ? `?heartbeat=${heartbeatEveryMs}` : ""}`,
    },
  },
  youtube: {
    path: YOUTUBE,
    import: {
      music: {
        path: `${YOUTUBE}/import/music`,
        one: {
          withParams: (youtubeId: string) => `${YOUTUBE}/import/music/one/${youtubeId}`,
        },
        playlist: {
          withParams: (playlistId: string) => `${YOUTUBE}/import/music/playlist/${playlistId}`,
        },
      },
    },
  },
  musics: {
    path: MUSICS,
    withParams: (id: string)=>`${MUSICS}/${id}`,
    search: {
      path: `${MUSICS}/search`,
    },
    fileInfo: {
      path: `${MUSICS_FILE_INFO}`,
      withParams: (id: string)=>`${MUSICS_FILE_INFO}/${id}`,
      upload: {
        path: `${MUSICS_FILE_INFO}/upload`,
      },
    },
    history: {
      path: MUSICS_HISTORY,
      withParams: (id: string) => `${MUSICS_HISTORY}/${id}`,
      search: {
        path: MUSICS_HISTORY + "/search",
      },
    },
    slug: {
      path: MUSICS_SLUG,
      withParams: (slug: string, query?: MusicSlugQueryParams) => {
        let ret = `${MUSICS_SLUG}/${slug}`;

        if (query && Object.entries(query).length > 0)
          ret += `?${new URLSearchParams(query).toString()}`;

        return ret;
      },
    },
    playlists: {
      path: MUSICS_PLAYLISTS,
      withParams: (id: string) => `${MUSICS_PLAYLISTS}/${id}`,
      track: {
        withParams: (id: string, trackNumber: number) => `${MUSICS_PLAYLISTS}/${id}/track/${trackNumber}`,
        move: {
          withParams: (
            id: string,
            itemId: string,
            newIndex: number,
          ) => `${MUSICS_PLAYLISTS}/${id}/track/move/${itemId}/${newIndex}`,
        },
      },
      user: {
        withParams: (userId: string) => `${MUSICS_PLAYLISTS}/user/${userId}`,
      },
      slug: {
        withParams: (user: string, slug: string, trackNumber?: number) => `${MUSICS_PLAYLISTS}/user/${user}/${slug}${trackNumber ? `/track/${trackNumber}` : ""}`,
      },
    },
    pickRandom: {
      path: MUSICS_RANDOM,
    },
    admin: {
      fixInfo: {
        path: `${MUSICS_ADMIN}/fix-info`,
      },
      searchDuplicates: {
        path: `${MUSICS_ADMIN}/search-duplicates`,
      },
      updateRemote: {
        path: `${MUSICS_ADMIN}/update-remote`,
      },
    },
  },
  logs: {
    path: "/api/logs",
  },
  episodes: {
    path: EPISODES,
    withParams: (id: string) => `${EPISODES}/${id}`,
    search: {
      path: `${EPISODES}/search`,
    },
    slug: {
      path: EPISODES_SLUG,
      withParams: (seriesKey: string, episodeKey: string, query?: MusicSlugQueryParams) => {
        let ret = `${EPISODES_SLUG}/${seriesKey}/${episodeKey}`;

        if (query && Object.entries(query).length > 0)
          ret += `?${new URLSearchParams(query).toString()}`;

        return ret;
      },
    },
    dependencies: {
      path: EPISODES_DEPENDENCIES,
      withParams: (
        seriesKey: EpisodeCompKey["seriesKey"],
        episodeKey: EpisodeCompKey["episodeKey"],
      ) => `${EPISODES_DEPENDENCIES}/${seriesKey}/${episodeKey}`,
    },
    fileInfo: {
      path: EPISODES_FILE_INFO,
      withParams: (id: string) => `${EPISODES_FILE_INFO}/${id}`,
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
    admin: {
      updateLastTimePlayed: {
        path: EPISODES_ADMIN + "/update-last-time-played",
      },
      fileInfoUpdateSaved: {
        path: EPISODES_ADMIN + "/file-info/update/saved",
      },
      addNewFiles: {
        path: EPISODES_ADMIN + "/add-new-files",
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
    fixer: {
      path: "/api/streams/fixer",
    },
  },
  player: {
    path: PLAYER,
    play: {
      episode: {
        path: PLAYER_PLAY_EPISODE,
        withParams: (seriesKey: string, episodeKey: string) => `${PLAYER_PLAY_EPISODE}/${seriesKey}/${episodeKey}`,
      },
      music: {
        path: PLAYER_PLAY_MUSIC,
        withParams: (slug: string) => `${PLAYER_PLAY_MUSIC}/${slug}`,
      },
      stream: {
        path: PLAYER_PLAY_STREAM,
        withParams: (streamId: string) => `${PLAYER_PLAY_STREAM}/${streamId}`,
      },
    },
  },
} satisfies PathRoutes;
