/* eslint-disable require-await */
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

export default class LimiterWeightFixer implements WeightFixer {
  // eslint-disable-next-line class-methods-use-this
  async fixWeight( {currentWeight, resources}: WeightFixerParams): Promise<number> {
    const limit = Number.MAX_SAFE_INTEGER / resources.length;

    return Math.min(currentWeight, limit);
  }
}