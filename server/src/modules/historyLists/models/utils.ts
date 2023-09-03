import { EpisodeFullId } from "#modules/episodes";
import { getDateNow } from "#utils/time";
import { HistoryEntry } from "..";
import Entry from "./HistoryEntry";

export function createHistoryEntryByEpisodeFullId(episodeFullId: EpisodeFullId): HistoryEntry {
  const newEntry: Entry = {
    date: getDateNow(),
    episodeId: episodeFullId.episodeId,
    serieId: episodeFullId.serieId,
  };

  return newEntry;
}