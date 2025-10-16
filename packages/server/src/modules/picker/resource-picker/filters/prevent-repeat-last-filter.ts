import { isDefined } from "$shared/utils/validation";
import { Filter } from "./filter";
import { CompareIdFunc } from "./utils";

type Params<ID, R> = {
  lastId: ID | undefined;
  compareId: CompareIdFunc<ID>;
  getResourceId: (r: R)=> ID;
};
export class PreventRepeatLastFilter<ID = string, R = unknown>
implements Filter<R> {
  #params: Params<ID, R>;

  constructor(params: Params<ID, R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(resource: R): Promise<boolean> {
    if (!isDefined(this.#params.lastId))
      return true;

    if (!this.#params.compareId(this.#params.getResourceId(resource), this.#params.lastId))
      return true;

    return false;
  }
}
