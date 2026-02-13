import { Filter } from "./filter";

export abstract class RemoveWeightLowerOrEqualThanFilter<R> implements Filter<R> {
  #num: number;

  constructor(num: number) {
    this.#num = num;
  }

  // eslint-disable-next-line require-await
  async filter(resource: R): Promise<boolean> {
    return this.getWeight(resource) >= this.#num;
  }

  abstract getWeight(self: R): number;
}
