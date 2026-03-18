import { GET_MANY_CRITERIA_PATH, GET_ONE_CRITERIA_PATH } from "../../routing/routes-utils";

const MUSICS = "/api/musics";
const MUSICS_SLUG = `${MUSICS}/slug`;
const MUSICS_PLAYLISTS = `${MUSICS}/playlists`;
const MUSICS_SMART_PLAYLISTS = `${MUSICS}/smart-playlists`;
const MUSICS_RANDOM = `${MUSICS}/random`;
const MUSICS_ADMIN = `${MUSICS}/admin`;
const MUSICS_FILE_INFO = `${MUSICS}/file-info`;
const MUSICS_HISTORY = `${MUSICS}/history`;
const GET_ONE = GET_ONE_CRITERIA_PATH;
const GET_MANY = GET_MANY_CRITERIA_PATH;

type SlugQueryParams = {
  format?: string;
  token?: string;
};

export const musicsRoutes = {
  path: MUSICS,
  withParams: (id: string) => `${MUSICS}/${id}`,
  getMany: {
    path: `${MUSICS}/${GET_MANY}`,
  },
  getOne: {
    path: `${MUSICS}/${GET_ONE}`,
  },
  bulk: {
    path: `${MUSICS}/bulk`,
  },
  userInfo: {
    withParams: (musicId: string) => `${MUSICS}/${musicId}/user-info`,
  },
  fileInfo: {
    path: MUSICS_FILE_INFO,
    withParams: (id: string) => `${MUSICS_FILE_INFO}/${id}`,
    getMany: {
      path: `${MUSICS_FILE_INFO}/${GET_MANY}`,
    },
    upload: {
      path: `${MUSICS_FILE_INFO}/upload`,
    },
  },
  history: {
    path: MUSICS_HISTORY,
    withParams: (id: string) => `${MUSICS_HISTORY}/${id}`,
    getMany: {
      path: `${MUSICS_HISTORY}/${GET_MANY}`,
    },
  },
  slug: {
    path: MUSICS_SLUG,
    withParams: (slug: string, query?: SlugQueryParams) => {
      let ret = `${MUSICS_SLUG}/${slug}`;

      if (query) {
        const nonEmptyQuery = Object.entries(query).filter(([_, v]) => !!v);

        if (nonEmptyQuery.length > 0)
          ret += `?${new URLSearchParams(nonEmptyQuery).toString()}`;
      }

      return ret;
    },
  },
  smartPlaylists: {
    path: MUSICS_SMART_PLAYLISTS,
    withParams: (id: string) => `${MUSICS_SMART_PLAYLISTS}/${id}`,
    getOne: {
      path: `${MUSICS_SMART_PLAYLISTS}/${GET_ONE}`,
    },
    getMany: {
      path: `${MUSICS_SMART_PLAYLISTS}/${GET_MANY}`,
    },
    slug: {
      withParams: ( { userSlug, smartPlaylistSlug }: {
        userSlug: string;
        smartPlaylistSlug?: string;
      } ) => `${MUSICS_SMART_PLAYLISTS}/user/${userSlug}${smartPlaylistSlug ? `/${smartPlaylistSlug}` : ""}`,
    },
  },
  frontend: {
    path: "/musics",
    withParams: (params: {id: string} ) => `/musics/${params.id}`,
    slug: {
      withParams: ( { slug, token, autoplay }: {
        slug: string;
        token?: string;
        autoplay?: boolean;
      } ) => {
        const url = `/musics/slug/${slug}`;
        const params = new URLSearchParams();

        if (token)
          params.append("token", token);

        if (autoplay)
          params.append("autoplay", "1");

        const query = params.toString();

        return query ? `${url}?${query}` : url;
      },
    },
    playlists: {
      path: "/musics/playlists",
      withParams: ( { playlistId, token }: {
        playlistId: string;
        token?: string;
      } ) => {
        const url = `/musics/playlists/${playlistId}`;

        return token ? `${url}?token=${token}` : url;
      },
      slug: {
        path: "/musics/playlists/slug",
        withParams: ( { playlistSlug, userSlug, token, autoplay }: {
          playlistSlug: string;
          userSlug: string;
          token?: string;
          autoplay?: boolean;
        } ) => {
          const url = `/musics/playlists/slug/${userSlug}/${playlistSlug}`;
          const params = new URLSearchParams();

          if (token)
            params.append("token", token);

          if (autoplay)
            params.append("autoplay", "1");

          const query = params.toString();

          return query ? `${url}?${query}` : url;
        },
      },
    },
    smartPlaylists: {
      path: "/musics/smart-playlists",
      withParams: (params: {id: string;
autoplay?: boolean;} ) => `/musics/smart-playlists/${params.id}${params.autoplay ? "?autoplay=1" : ""}`,
      slug: {
        withParams: (userSlug: string, smartPlaylistSlug: string) => `/musics/smart-playlists/slug/${userSlug}/${smartPlaylistSlug}`,
      },
    },
    history: {
      path: "/musics/history",
      withParams: (id: string) => `/musics/history/${id}`,
    },
    search: {
      path: "/musics/search",
    },
  },
  playlists: {
    path: MUSICS_PLAYLISTS,
    getOne: {
      path: `${MUSICS_PLAYLISTS}/${GET_ONE}`,
    },
    getMany: {
      path: `${MUSICS_PLAYLISTS}/${GET_MANY}`,
    },
    getManyByUser: {
      withParams: (userId: string) => `${MUSICS_PLAYLISTS}/user/${userId}`,
    },
    withParams: (id: string) => `${MUSICS_PLAYLISTS}/${id}`,
    track: {
      withParams: (id: string) => `${MUSICS_PLAYLISTS}/${id}/track`,
      addTrack: {
        withParams: (playlistId: string) => `${MUSICS_PLAYLISTS}/${playlistId}/track`,
      },
      removeManyTracks: {
        withParams: (playlistId: string) => `${MUSICS_PLAYLISTS}/${playlistId}/track`,
      },
      index: {
        withParams: (id: string, trackNumber: number) => `${MUSICS_PLAYLISTS}/${id}/track/${trackNumber}`,
      },
      move: {
        withParams: (id: string, itemId: string, newIndex: number) => `${MUSICS_PLAYLISTS}/${id}/track/move/${itemId}/${newIndex}`,
      },
    },
    user: {
      withParams: (userId: string) => `${MUSICS_PLAYLISTS}/user/${userId}`,
    },
    slug: {
      withParams: ( { userSlug, playlistSlug, trackNumber }: {
        userSlug: string;
        playlistSlug?: string;
        trackNumber?: number;
      } ) => `${MUSICS_PLAYLISTS}/user/${userSlug}${playlistSlug ? `/${playlistSlug}` : ""}${playlistSlug && trackNumber ? `/track/${trackNumber}` : ""}`,
    },
  },
  pickRandom: {
    path: MUSICS_RANDOM,
    withParams: ( { q, token, format }: {
      q: string;
      token?: string;
      format?: "json" | "m3u8" | "raw";
    } ) => {
      const params = new URLSearchParams( {
        q,
      } );

      if (token)
        params.append("token", token);

      if (format)
        params.append("format", format);

      return `${MUSICS_RANDOM}?${params.toString()}`;
    },
  },
  usersLists: {
    path: `${MUSICS}/users-lists`,
    move: {
      path: `${MUSICS}/users-lists/move`,
    },
    myLists: {
      path: `${MUSICS}/users-lists/my-lists`,
    },
  },
  admin: {
    path: MUSICS_ADMIN,
    fixInfo: {
      path: `${MUSICS_ADMIN}/fix-info`,
    },
    searchDuplicates: {
      path: `${MUSICS_ADMIN}/search-duplicates`,
    },
    updateRemote: {
      path: `${MUSICS_ADMIN}/update-remote`,
    },
    updateFileInfos: {
      path: `${MUSICS_ADMIN}/update-file-infos`,
    },
    fileInfoUpdateOffloaded: {
      path: `${MUSICS_ADMIN}/update-file-info-offloaded`,
    },
  },
};
