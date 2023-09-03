import { Resource } from "#modules/utils/resource";

export default interface Filter<R extends Resource> {
  filter(resource: R): Promise<boolean>;
}