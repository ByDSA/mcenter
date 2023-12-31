import { Pickable } from "#shared/models/resource";
import Filter from "./Filter";

export default class MinWeightFilter implements Filter {
  #num: number;

  constructor(num: number) {
    this.#num = num;
  }

  // eslint-disable-next-line require-await
  async filter(self: Pickable): Promise<boolean> {
    return self.weight >= this.#num;
  }
}