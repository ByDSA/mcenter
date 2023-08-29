import { EpisodeFullId } from "#modules/episodes";
import { DateType } from "#utils/time";

export default interface Entry extends EpisodeFullId {
  date: DateType;
}
