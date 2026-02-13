import { ResourcePicker } from "./resource-picker";

type Params<R> = {
  resources: R[];
  lastId: string | null;
  getId: (r: R)=> string;
};
export class ResourcePickerSequential<R = unknown>
implements ResourcePicker<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  getId(r: R) {
    return this.#params.getId(r);
  }

  // eslint-disable-next-line require-await
  async pick(n = 1): Promise<R[]> {
    let index = -1;
    const ret: R[] = [];
    const id = this.#params.lastId;

    if (id !== undefined)
      index = this.#params.resources.findIndex((e) => this.#params.getId(e) === id);

    for (let i = 0; i < n; i++) {
      index = (index + 1) % this.#params.resources.length;
      ret.push(this.#params.resources[index]);
    }

    return ret;
  }
}
