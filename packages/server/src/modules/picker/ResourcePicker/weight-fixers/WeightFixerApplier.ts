import { Pickable } from "#shared/models/resource";
import { Picker } from "rand-picker";
import WeightFixer from "./WeightFixer";

export default class WeightFixerApplier<R extends Pickable = Pickable> {
  #weightFixers: WeightFixer<R>[] = [];

  constructor() {
  }

  add(...fixers: WeightFixer<R>[]): void {
    this.#weightFixers.push(...fixers);
  }

  async apply(picker: Picker<R>): Promise<void> {
    const resources = picker.data;

    for (const resource of resources) {
      let currentWeight: number = picker.getWeight(resource) ?? 1;

      for (const weightFixer of this.#weightFixers) {
        currentWeight = await weightFixer.fixWeight( {
          resource,
          resources,
          currentWeight,
        } );
      }

      picker.put(resource, currentWeight);
    }
  }
}
