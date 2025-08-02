import { Pickable } from "#modules/resources/models";
import { Filter } from "./filter";

export class RemoveWeightLowerOrEqualThanFilter implements Filter {
  #num: number;

  constructor(num: number) {
    this.#num = num;
  }

  // eslint-disable-next-line require-await
  async filter(self: Pickable): Promise<boolean> {
    return self.weight >= this.#num;
  }
}
