import { Pickable } from "#shared/models/resource";
import Filter from "./Filter";

export default class FilterApplier<R extends Pickable = Pickable> {
  #filters: Filter<R>[] = [];

  add(...filters: Filter<R>[]): void {
    this.#filters.push(...filters);
  }

  async apply(data: readonly R[]): Promise<R[]> {
    console.log("Filtering...");
    const newData: R[] = [];

    // eslint-disable-next-line no-restricted-syntax, no-labels
    main: for (const self of data) {
      for (const f of this.#filters) {
        // eslint-disable-next-line no-await-in-loop
        if (!await f.filter(self))
          // eslint-disable-next-line no-labels, no-continue
          continue main;
      }

      newData.push(self);
    }

    return newData;
  }
}