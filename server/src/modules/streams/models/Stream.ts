export enum Mode {
  SEQUENTIAL = "SEQUENTIAL",
  RANDOM = "RANDOM"
}

export type ModelId = string;

export default interface Model {
  id: ModelId;
  group: string;
  mode: Mode;
}
