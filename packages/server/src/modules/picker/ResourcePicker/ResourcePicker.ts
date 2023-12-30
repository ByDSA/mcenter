import { Resource } from "#shared/models/resource";

export default interface ResourcePicker<R extends Resource = Resource> {
  pick(n: number): Promise<R[]>;
}