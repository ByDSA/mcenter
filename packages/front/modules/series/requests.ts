/* eslint-disable import/prefer-default-export */
import { episodesBackendUrl } from "./episodes";
import { historyBackendUrls } from "./history";
import { streamsBackendUrls } from "./streams";

export const backendUrls = {
  episodes: episodesBackendUrl,
  history: historyBackendUrls,
  streams: streamsBackendUrls,
};