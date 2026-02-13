import { Filter } from "./filter";

type Params<R> = {
  lastId: string | null;
  getId: (r: R)=> string;
};
export class PreventRepeatLastFilter<R = unknown>
implements Filter<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(resource: R): Promise<boolean> {
    if (this.#params.lastId === null)
      return true;

    if (this.#params.getId(resource) !== this.#params.lastId)
      return true;

    return false;
  }
}
