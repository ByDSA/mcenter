import { getDateNow } from "../../utils/time";
import { EpisodeId } from "../episodes";
import { HistoryEntry } from "./HistoryEntry";

export function createHistoryEntryByEpisodeFullId(episodeId: EpisodeId): HistoryEntry {
  const newEntry: HistoryEntry = {
    date: getDateNow(),
    episodeId,
  };

  return newEntry;
}
