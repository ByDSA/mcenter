/* eslint-disable class-methods-use-this */
import { Resource } from "#shared/models/resource";
import { isDefined } from "#shared/utils/validation";
import Filter from "./Filter";
import { CompareResourceIdFunc } from "./utils";

type Params<ID, R extends Resource> = {
  lastId: ID | undefined;
  compareResourceId: CompareResourceIdFunc<R,ID>;
};
export default class PreventRepeatLastFilter<ID = string, R extends Resource = Resource> implements Filter<R>{
  #params: Params<ID, R>;

  constructor(params: Params<ID, R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(resource: R): Promise<boolean> {
    if (!isDefined(this.#params.lastId))
      return true;

    if (!this.#params.compareResourceId(resource, this.#params.lastId))
      return true;

    return false;
  }
}