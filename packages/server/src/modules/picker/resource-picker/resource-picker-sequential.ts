import { ResourceEntity } from "$shared/models/resource";
import { Resource } from "#modules/resources/models";
import { ResourcePicker } from "./resource-picker";
import { CompareIdFunc } from "./filters/utils";

type Params<ID, R extends Resource> = {
  resources: R[];
  lastId?: ID;
  compareId: CompareIdFunc<ID>;
  getId: (r: R)=> ID;
};
export class ResourcePickerSequential<ID = string, R extends ResourceEntity = ResourceEntity>
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
    return this.#params.resources.findIndex((e) => this.#params.compareId(
      this.#params.getId(e),
      id,
    ));
  }

  #calcNextIndex(index: number): number {
    return (index + 1) % this.#params.resources.length;
  }
}
