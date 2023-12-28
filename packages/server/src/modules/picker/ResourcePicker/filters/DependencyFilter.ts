import { Resource } from "#shared/models/resource";
import { isDefined } from "#shared/utils/validation";
import Filter from "./Filter";
import { CompareFunc, CompareResourceIdFunc } from "./utils";

type Params<ID, R extends Resource> = {
  lastId: ID | null;
  firstId: ID;
  secondId: ID;
  compareId: CompareFunc<ID>;
  compareResourceId: CompareResourceIdFunc<R, ID>;
};
export default class DependencyFilter<ID = string, R extends Resource = Resource> implements Filter<R> {
  #params: Params<ID, R>;

  constructor(params: Params<ID, R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(self: R): Promise<boolean> {
    if (!isDefined(this.#params.lastId))
      return true;

    if (this.#params.compareId(this.#params.lastId, this.#params.firstId))
      return this.#params.compareResourceId(self, this.#params.secondId);

    return true;
  }
}