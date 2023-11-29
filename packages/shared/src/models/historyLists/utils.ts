import { getDateNow } from "../../utils/time";
import { EpisodeFullId } from "../episodes";
import Entry from "./HistoryEntry";

export function createHistoryEntryByEpisodeFullId(episodeFullId: EpisodeFullId): Entry {
  const newEntry: Entry = {
    date: getDateNow(),
    episodeId: episodeFullId.episodeId,
    serieId: episodeFullId.serieId,
  };

  return newEntry;
}