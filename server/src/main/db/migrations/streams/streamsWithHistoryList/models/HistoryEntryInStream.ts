import { EpisodeId } from "#modules/episodes";
import { DateType } from "#utils/time";

/**
 * @deprecated
 */
export default interface HistoryEntryInStream {
  episodeId: EpisodeId;
  date: DateType;
}
