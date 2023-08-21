import { EpisodeId } from "#modules/series";
import { DateType } from "src/utils/time/date-type";

export default interface HistoryEntry {
  date: DateType;
  episodeId: EpisodeId;
}
