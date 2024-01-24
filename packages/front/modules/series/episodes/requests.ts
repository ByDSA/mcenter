import { rootBackendUrl } from "#modules/requests";

/* eslint-disable import/prefer-default-export */
export const backendUrl = {
  crud: {
    get: `${rootBackendUrl}/api/episodes`,
    patch: ( {episodeId, serieId}: {episodeId: string; serieId: string} )=>`${rootBackendUrl}/api/episodes/${serieId}/${episodeId}`,
    search: `${rootBackendUrl}/api/episodes/search`,
  },
};