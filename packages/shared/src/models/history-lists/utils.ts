import { getDateNow } from "../../utils/time";
import { EpisodeId } from "../episodes";
import { HistoryEntry } from "./history-entry";

export function createHistoryEntryByEpisodeFullId(episodeId: EpisodeId): HistoryEntry {
  const newEntry: HistoryEntry = {
    date: getDateNow(),
    episodeId: episodeId,
  };

  return newEntry;
}
