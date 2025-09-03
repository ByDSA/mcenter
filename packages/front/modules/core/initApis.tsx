"use client";

import { MusicFileInfosApi } from "#modules/musics/file-info/requests";
import { MusicHistoryApi } from "#modules/musics/history/requests";
import { MusicsApi } from "#modules/musics/requests";
import { EpisodeFileInfosApi } from "#modules/series/episodes/file-info/requests";
import { EpisodeHistoryApi } from "#modules/series/episodes/history/requests";
import { EpisodesApi } from "#modules/series/episodes/requests";
import { logger } from "./logger";

let init = false;

export function InitApis() {
  if (init)
    return null;

  init = true;
  MusicsApi.register();
  MusicHistoryApi.register();
  MusicFileInfosApi.register();
  EpisodesApi.register();
  EpisodeFileInfosApi.register();
  EpisodeHistoryApi.register();

  logger.debug("APIs registradas ✅ (cliente)");

  return null;
}
