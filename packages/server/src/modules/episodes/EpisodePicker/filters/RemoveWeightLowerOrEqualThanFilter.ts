import { Model } from "../../models";
import Filter from "./Filter";

export default class RemoveWeightLowerOrEqualThan implements Filter<Model> {
  #num: number;

  constructor(num: number) {
    this.#num = num;
  }

  // eslint-disable-next-line require-await
  async filter(self: Model): Promise<boolean> {
    return self.weight > this.#num;
  }
}