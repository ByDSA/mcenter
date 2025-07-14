import type { EpisodeId } from "..";
import type { EpisodeHistoryEntry } from "./history-entry";
import { getDateNow } from "../../../utils/time";

export function createEpisodeHistoryEntryByEpisodeFullId(
  episodeId: EpisodeId,
): EpisodeHistoryEntry {
  const newEntry: EpisodeHistoryEntry = {
    date: getDateNow(),
    episodeId: episodeId,
  };

  return newEntry;
}
