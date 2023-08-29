import Entry from "./HistoryEntry";

export type ModelId = string;

export default interface Model {
  id: ModelId;
  entries: Entry[];
  maxSize: number;
}
