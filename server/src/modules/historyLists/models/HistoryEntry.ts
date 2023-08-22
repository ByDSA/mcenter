import { EpisodeFullId } from "#modules/episodes";
import { DateType } from "#utils/time";

export default interface HistoryEntry extends EpisodeFullId {
  date: DateType;
}
