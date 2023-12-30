import { getDateNow } from "../../utils/time";
import { EpisodeId } from "../episodes";
import Entry from "./HistoryEntry";

export function createHistoryEntryByEpisodeFullId(episodeId: EpisodeId): Entry {
  const newEntry: Entry = {
    date: getDateNow(),
    episodeId,
  };

  return newEntry;
}