import { isDefined } from "#shared/utils/validation";
import { Filter } from "./Filter";
import { CompareIdFunc } from "./utils";
import { Resource } from "#modules/resources/models";

type Params<ID> = {
  lastId: ID | undefined;
  compareId: CompareIdFunc<ID>;
};
export class PreventRepeatLastFilter<ID = string, R extends Resource<ID> = Resource<ID>>
implements Filter<R> {
  #params: Params<ID>;

  constructor(params: Params<ID>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(resource: R): Promise<boolean> {
    if (!isDefined(this.#params.lastId))
      return true;

    if (!this.#params.compareId(resource.id, this.#params.lastId))
      return true;

    return false;
  }
}
