import { Pickable } from "#shared/models/resource";

export default interface Filter<R extends Pickable = Pickable> {
  filter(resource: R): Promise<boolean>;
}