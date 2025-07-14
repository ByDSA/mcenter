import { Resource } from "#modules/resources/models";

export interface ResourcePicker<R extends Resource = Resource> {
  pick(n: number): Promise<R[]>;
}
