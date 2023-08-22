import { HistoryEntry } from "#modules/history";
import { Stream } from "#modules/stream/model";

/**
 * @deprecated
 */
export default interface StreamWithHistoryList extends Stream {
  maxHistorySize: number;
  history: HistoryEntry[];
}
