/* eslint-disable require-await */
import { WeightFixer, WeightFixerParams } from "./WeightFixer";

export class LimiterWeightFixer implements WeightFixer {
  #limit: number;

  constructor(limit: number) {
    this.#limit = limit;
  }

  async fixWeight( { currentWeight }: WeightFixerParams): Promise<number> {
    return Math.min(currentWeight, this.#limit);
  }
}
