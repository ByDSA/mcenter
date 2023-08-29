export enum Mode {
  SEQUENTIAL = "SEQUENTIAL",
  RANDOM = "RANDOM"
}

export type ModelId = string;

export enum OriginType {
  SERIE = "serie",
  STREAM = "stream"
};

export type Origin = {
  type: OriginType;
  id: string;
};

export type Group = {
  origins: Origin[];
};

export default interface Model {
  id: ModelId;
  group: Group;
  mode: Mode;
}
