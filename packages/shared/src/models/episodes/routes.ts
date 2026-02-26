import { GET_MANY_CRITERIA_PATH, GET_ONE_CRITERIA_PATH } from "../../routing/routes-utils";

const EPISODES = "/api/episodes";
const EPISODES_SLUG = `${EPISODES}/slug`;
const EPISODES_HISTORY = `${EPISODES}/history`;
const EPISODES_FILE_INFO = `${EPISODES}/file-info`;
const EPISODES_DEPENDENCIES = `${EPISODES}/dependencies`;
const EPISODES_ADMIN = `${EPISODES}/admin`;
const SERIES = `${EPISODES}/series`;
const GET_ONE = GET_ONE_CRITERIA_PATH;
const GET_MANY = GET_MANY_CRITERIA_PATH;

type SlugQueryParams = {
  format?: string;
  token?: string;
};

export const episodesRoutes = {
  path: EPISODES,
  withParams: (id: string, query?: SlugQueryParams) => {
    let ret = `${EPISODES}/${id}`;

    if (query) {
      const nonEmptyQuery = Object.entries(query).filter(([_, v]) => !!v);

      if (nonEmptyQuery.length > 0)
        ret += `?${new URLSearchParams(query).toString()}`;
    }

    return ret;
  },
  getOne: {
    path: `${EPISODES}/${GET_ONE}`,
  },
  getMany: {
    path: `${EPISODES}/${GET_MANY}`,
  },
  userInfo: {
    withParams: (episodeId: string) => `${EPISODES}/${episodeId}/user-info`,
  },
  slug: {
    path: EPISODES_SLUG,
    withParams: (seriesKey: string, episodeKey: string, query?: SlugQueryParams) => {
      let ret = `${EPISODES_SLUG}/${seriesKey}/${episodeKey}`;

      if (query) {
        const nonEmptyQuery = Object.entries(query).filter(([_, v]) => !!v);

        if (nonEmptyQuery.length > 0)
          ret += `?${new URLSearchParams(query).toString()}`;
      }

      return ret;
    },
  },
  dependencies: {
    path: EPISODES_DEPENDENCIES,
    withParams: (lastEpisodeId: string) => `${EPISODES_DEPENDENCIES}/${lastEpisodeId}`,
  },
  fileInfo: {
    path: EPISODES_FILE_INFO,
    withParams: (id: string) => `${EPISODES_FILE_INFO}/${id}`,
    upload: {
      path: `${EPISODES_FILE_INFO}/upload`,
    },
  },
  history: {
    path: EPISODES_HISTORY,
    entries: {
      withParams: (entryId: string) => `${EPISODES_HISTORY}/entries/${entryId}`,
      getMany: {
        path: `${EPISODES_HISTORY}/entries/${GET_MANY}`,
      },
    },
  },
  admin: {
    updateLastTimePlayed: {
      path: `${EPISODES_ADMIN}/update-last-time-played`,
    },
    fileInfoUpdateSaved: {
      path: `${EPISODES_ADMIN}/file-info/update/saved`,
    },
    fileInfoUpdateOffloaded: {
      path: `${EPISODES_ADMIN}/file-info/update/offloaded`,
    },
    addNewFiles: {
      path: `${EPISODES_ADMIN}/add-new-files`,
    },
  },
  series: {
    path: SERIES,
    getMany: {
      path: `${SERIES}/${GET_MANY}`,
    },
    withParams: (id: string) => `${SERIES}/${id}`,
    seasons: {
      withParams: (id: string) => `${SERIES}/${id}/seasons`,
    },
  },
  frontend: {
    history: {
      path: "/series/history",
    },
    lists: {
      path: "/series/lists",
      withParams: ( { serieId }: { serieId: string } ) => `/series/lists/${serieId}`,
      episode: {
        withParams: ( { episodeId, autoplay, token }: {
          episodeId: string;
          autoplay?: boolean;
          token?: string;
        } ) => {
          const url = `/series/episodes/${episodeId}`;
          const params = new URLSearchParams();

          if (autoplay)
            params.append("autoplay", "1");

          if (token)
            params.append("token", token);

          const query = params.toString();

          return query ? `${url}?${query}` : url;
        },
      },
    },
  },
};
