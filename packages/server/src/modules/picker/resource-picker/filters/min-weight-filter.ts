import { Filter } from "./filter";

export abstract class RemoveWeightLowerOrEqualThanFilter<R> implements Filter<R> {
  #num: number;

  constructor(num: number) {
    this.#num = num;
  }

  // eslint-disable-next-line require-await
  async filter(self: R): Promise<boolean> {
    return this.getWeight(self) >= this.#num;
  }

  abstract getWeight(self: R): number;
}
