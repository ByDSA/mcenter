import { Pickable } from "#shared/models/resource";
import Filter from "./Filter";

export default class FilterApplier<R extends Pickable = Pickable> {
  #nonReversibleFilters: Filter<R>[] = [];

  #reversibleFilters: Filter<R>[] = [];

  add(...filters: Filter<R>[]): void {
    this.#nonReversibleFilters.push(...filters);
  }

  addReversible(...filters: Filter<R>[]): void {
    this.#reversibleFilters.push(...filters);
  }

  async apply(data: R[]): Promise<R[]> {
    let currentData: R[] = data;

    {
      const newData: R[] = [];

      for (const self of currentData) {
        if (await applyFiltersToResource(self, this.#nonReversibleFilters))
          newData.push(self);
      }

      currentData = newData;
    }

    for (const f of this.#reversibleFilters) {
      const newData: R[] = [];

      for (const self of currentData) {
        if (await f.filter(self))
          newData.push(self);
      }

      if (newData.length > 0)
        currentData = newData;
    }

    return currentData;
  }
}

async function applyFiltersToResource<R extends Pickable>(
  resource: R,
  filters: Filter[],
): Promise<boolean> {
  for (const f of filters) {
    if (!await f.filter(resource))
      return false;
  }

  return true;
}
