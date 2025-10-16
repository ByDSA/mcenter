/* eslint-disable require-await */
import { WeightFixer, WeightFixerParams } from "./weight-fixer";

export class LimiterWeightFixer<R> implements WeightFixer<R> {
  #limit: number;

  constructor(limit: number) {
    this.#limit = limit;
  }

  async fixWeight( { currentWeight }: WeightFixerParams<R>): Promise<number> {
    return Math.min(currentWeight, this.#limit);
  }
}
