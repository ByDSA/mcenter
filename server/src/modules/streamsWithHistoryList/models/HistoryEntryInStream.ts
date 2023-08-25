import { EpisodeId } from "#modules/episodes";
import { DateType } from "#utils/time";

/**
 * @deprecated
 */
export default interface HistoryEntryInStream {
  id: EpisodeId;
  date: DateType;
}
