import { Resource } from "#modules/resources/models";
import { ResourcePicker } from "./ResourcePicker";
import { CompareIdFunc } from "./filters/utils";

type Params<ID, R extends Resource<ID>> = {
  resources: R[];
  lastId?: ID;
  compareId: CompareIdFunc<ID>;
};
export class ResourcePickerSequential<ID = string, R extends Resource<ID> = Resource<ID>>
implements ResourcePicker {
  #params: Params<ID, R>;

  constructor(params: Params<ID, R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async pick(n: number = 1): Promise<R[]> {
    let index = -1;
    const ret: R[] = [];
    const id = this.#params.lastId;

    if (id !== undefined)
      index = this.#findIndexById(id);

    for (let i = 0; i < n; i++) {
      index = this.#calcNextIndex(index);
      ret.push(this.#params.resources[index]);
    }

    return ret;
  }

  #findIndexById(id: ID): number {
    return this.#params.resources.findIndex((e) => this.#params.compareId(e.id, id));
  }

  #calcNextIndex(index: number): number {
    return (index + 1) % this.#params.resources.length;
  }
}
