/* eslint-disable require-await */
import { Model } from "../../models";
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

export default class LimiterWeightFixer implements WeightFixer<Model> {
  #limit: number;

  constructor(limit: number) {
    this.#limit = limit;
  }

  async fixWeight( {currentWeight}: WeightFixerParams<Model>): Promise<number> {
    const weight = currentWeight || 1;

    return Math.min(weight, this.#limit);
  }
}