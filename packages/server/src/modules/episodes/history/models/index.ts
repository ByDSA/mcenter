import { EpisodeHistoryEntry as Entry } from "$shared/models/episodes/history";

export * from "$shared/models/episodes/history";

export function getIdFromEntry(entry: Entry): string {
  return entry.date.timestamp.toString();
}
