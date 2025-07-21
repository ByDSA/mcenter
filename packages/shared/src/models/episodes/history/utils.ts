import type { EpisodeCompKey } from "..";
import type { EpisodeHistoryEntry } from "./history-entry";
import { getDateNow } from "../../../utils/time";

export function createEpisodeHistoryEntryByEpisodeCompKey(
  episodeCompKey: EpisodeCompKey,
): EpisodeHistoryEntry {
  const newEntry: EpisodeHistoryEntry = {
    date: getDateNow(),
    episodeCompKey,
  };

  return newEntry;
}
