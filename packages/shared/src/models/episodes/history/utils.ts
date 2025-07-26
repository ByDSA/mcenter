import type { EpisodeCompKey } from "..";
import type { EpisodeHistoryEntry } from "./history-entry";
import type { StreamEntity } from "../../streams";
import { getDateNow } from "../../../utils/time";

export function createEpisodeHistoryEntry(
  episodeCompKey: EpisodeCompKey,
  streamId: StreamEntity["id"],
): EpisodeHistoryEntry {
  const newEntry: EpisodeHistoryEntry = {
    date: getDateNow(),
    episodeCompKey,
    streamId,
  };

  return newEntry;
}
