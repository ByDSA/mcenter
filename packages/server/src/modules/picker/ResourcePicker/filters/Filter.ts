import { Resource } from "#shared/models/resource";

export default interface Filter<R extends Resource> {
  filter(resource: R): Promise<boolean>;
}