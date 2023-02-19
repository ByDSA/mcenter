import { History } from "#modules/history";

export enum Mode {
  SEQUENTIAL = "SEQUENTIAL",
  RANDOM = "RANDOM"
}

export type StreamId = string;

export default interface Stream {
  id: StreamId;
  group: string;
  mode: Mode;
  maxHistorySize: number;
  history: History[];
}
