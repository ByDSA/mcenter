import { isDefined } from "$shared/utils/validation";
import { ResourceEntity } from "$shared/models/resources";
import { Filter } from "./filter";

type Params<ID, R> = {
  lastId: ID | null;
  firstId: ID;
  secondId: ID;
  getId: (r: R)=> ID;
};
export class DependencyFilter<ID = string, R extends ResourceEntity = ResourceEntity>
implements Filter<R> {
  #params: Params<ID, R>;

  constructor(params: Params<ID, R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(self: R): Promise<boolean> {
    if (!isDefined(this.#params.lastId))
      return true;

    if (this.#params.lastId === this.#params.firstId)
      return this.#params.getId(self) === this.#params.secondId;

    return true;
  }
}
