import { Pickable } from "#shared/models/resource";
import Filter from "./Filter";

export default class FilterApplier<R extends Pickable = Pickable> {
  #filters: Filter<R>[] = [];

  add(...filters: Filter<R>[]): void {
    this.#filters.push(...filters);
  }

  async apply(data: readonly R[]): Promise<R[]> {
    const newData: R[] = [];

    for (const self of data) {
      await this.#applyFiltersToResource(self)
        .then(ok=> {
          if (ok)
            newData.push(self);
        } );
    }

    return newData;
  }

  async #applyFiltersToResource(resource: R): Promise<boolean> {
    for (const f of this.#filters) {
      if (!await f.filter(resource))
        return false;
    }

    return true;
  }
}