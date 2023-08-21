import HistoryEntry from "./HistoryEntry";

export type HistoryListId = string;

export default interface HistoryList {
  id: HistoryListId;
  entries: HistoryEntry[];
}
