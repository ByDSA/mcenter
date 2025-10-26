"use client";

import { MusicFileInfosApi } from "#modules/musics/file-info/requests";
import { MusicHistoryApi } from "#modules/musics/history/requests";
import { MusicPlaylistsApi } from "#modules/musics/playlists/requests";
import { MusicsApi } from "#modules/musics/requests";
import { MusicUserInfosApi } from "#modules/musics/user-info.requests";
import { EpisodeFileInfosApi } from "#modules/series/episodes/file-info/requests";
import { EpisodeHistoryApi } from "#modules/series/episodes/history/requests";
import { EpisodesApi } from "#modules/series/episodes/requests";
import { EpisodeUserInfosApi } from "#modules/series/episodes/user-info/requests";
import { logger } from "./logger";

let init = false;

export function InitApis() {
  if (init)
    return null;

  init = true;
  MusicsApi.register();
  MusicUserInfosApi.register();
  MusicHistoryApi.register();
  MusicFileInfosApi.register();
  MusicPlaylistsApi.register();
  EpisodesApi.register();
  EpisodeUserInfosApi.register();
  EpisodeFileInfosApi.register();
  EpisodeHistoryApi.register();

  logger.debug("APIs registradas ✅ (cliente)");

  return null;
}
