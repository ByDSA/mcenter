import { assertIsDefined } from "#shared/utils/validation";

/* eslint-disable import/prefer-default-export */
export const BACKEND_URLS = {
  root: getBackendUrl(),
  resources: {
    musics: {
      crud: {
        patch: ( {id} )=>`${BACKEND_URLS.root}/api/musics/${id}`,
      },
      history: {
        crud: {
          search: ( {user} ) => `${BACKEND_URLS.root}/api/musics/history/${user}/search`,
        },
      },
      raw: ( {url} )=>`${BACKEND_URLS.root}/api/musics/raw/${url}`,
    },
    episodes: {
      crud: {
        get: `${getBackendUrl()}/api/episodes`,
        patch: ( {episodeId, serieId}: {episodeId: string; serieId: string} )=>`${getBackendUrl()}/api/episodes/${serieId}/${episodeId}`,
        search: `${getBackendUrl()}/api/episodes/search`,
      },
    },
    series: {
      historyList: {
        entries: {
          crud: {
            search: `${getBackendUrl()}/api/history-list/entries/search`,
          },
        },
        crud: {
          get: `${getBackendUrl()}/api/history-list`,
        },
      },
    },
    streams: {
      crud: {
        search: `${getBackendUrl()}/api/streams/criteria`,
      },
    },
  },
  actions: `${getBackendUrl()}/api/actions`,
  play: {
    stream: `${getBackendUrl()}/api/play/stream`,
  },
  socketUrl: getBackendUrl(),
};

export function getBackendUrl(): string {
  const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  assertIsDefined(envBackendUrl);

  const backendUrl = new URL(envBackendUrl);

  // get current hostname
  if (backendUrl.hostname === "localhost" && global.window !== undefined) {
    console.log("localhost detected, using",global.window.location.hostname);
    backendUrl.hostname = global.window.location.hostname;
  }

  let ret = backendUrl.toString();

  if (ret.endsWith("/"))
    ret = ret.slice(0, -1);

  return ret;
}