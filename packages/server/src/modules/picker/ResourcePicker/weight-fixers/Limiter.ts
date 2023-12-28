/* eslint-disable require-await */
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

export default class LimiterWeightFixer implements WeightFixer {
  #limit: number;

  constructor(limit: number) {
    this.#limit = limit;
  }

  async fixWeight( {currentWeight}: WeightFixerParams): Promise<number> {
    const weight = currentWeight || 1;

    return Math.min(weight, this.#limit);
  }
}