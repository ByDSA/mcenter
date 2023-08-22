import { HistoryEntry } from "#modules/historyLists";
import { Stream } from "#modules/streams";

/**
 * @deprecated
 */
export default interface StreamWithHistoryList extends Stream {
  maxHistorySize: number;
  history: HistoryEntry[];
}
