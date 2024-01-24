/* eslint-disable import/prefer-default-export */
import { backendUrl as episodesBackendUrl } from "./episodes/requests";
import { backendUrls as streamsBackendUrls } from "./streams/requests";

export const backendUrls = {
  episodes: episodesBackendUrl,
  streams: streamsBackendUrls,
};