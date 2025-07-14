import { isDefined } from "$shared/utils/validation";
import { ResourceEntity } from "$sharedSrc/models/resource";
import { Filter } from "./Filter";
import { CompareIdFunc } from "./utils";

type Params<ID> = {
  lastId: ID | null;
  firstId: ID;
  secondId: ID;
  compareId: CompareIdFunc<ID>;
};
export class DependencyFilter<ID = string, R extends ResourceEntity = ResourceEntity>
implements Filter<R> {
  #params: Params<ID>;

  constructor(params: Params<ID>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(self: R): Promise<boolean> {
    if (!isDefined(this.#params.lastId))
      return true;

    if (this.#params.compareId(this.#params.lastId, this.#params.firstId))
      return this.#params.compareId(self.id, this.#params.secondId);

    return true;
  }
}
