/* eslint-disable import/prefer-default-export */
import { backendUrls as episodesBackendUrls } from "./episodes/requests";
import { backendUrls as streamsBackendUrls } from "./streams/requests";

export const backendUrls = {
  episodes: episodesBackendUrls,
  streams: streamsBackendUrls,
};