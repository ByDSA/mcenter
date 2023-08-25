import { Stream } from "#modules/streams";
import HistoryEntryInStream from "./HistoryEntryInStream";

/**
 * @deprecated
 */
export default interface StreamWithHistoryList extends Stream {
  maxHistorySize: number;
  history: HistoryEntryInStream[];
}
