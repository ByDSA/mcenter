import { EpisodeFullId } from "#modules/series/episode";
import { DateType } from "src/utils/time/date-type";

export default interface HistoryEntry extends EpisodeFullId {
  date: DateType;
}
