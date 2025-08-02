import { Pickable } from "#modules/resources/models";

export interface Filter<R extends Pickable = Pickable> {
  filter(resource: R): Promise<boolean>;
}
