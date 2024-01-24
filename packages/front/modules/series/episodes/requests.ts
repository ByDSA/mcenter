import { rootBackendUrl } from "#modules/requests";

import { backendUrls as historyBackendUrls } from "./history/requests";
/* eslint-disable import/prefer-default-export */
export const backendUrl = {
  history: historyBackendUrls,
  crud: {
    get: `${rootBackendUrl}/api/episodes`,
    patch: ( {episodeId, serieId}: {episodeId: string; serieId: string} )=>`${rootBackendUrl}/api/episodes/${serieId}/${episodeId}`,
    search: `${rootBackendUrl}/api/episodes/search`,
  },
};