import { StreamId, StreamMode } from "#modules/streams";
import HistoryEntryInStream from "./HistoryEntryInStream";

/**
 * @deprecated
 */
export default interface StreamWithHistoryList {
  id: StreamId;
  group: string;
  mode: StreamMode;
  maxHistorySize: number;
  history: HistoryEntryInStream[];
}
