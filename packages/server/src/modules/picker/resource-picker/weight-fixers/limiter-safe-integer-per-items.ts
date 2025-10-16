/* eslint-disable require-await */
import { WeightFixer, WeightFixerParams } from "./weight-fixer";

export class LimiterWeightFixer<R> implements WeightFixer<R> {
  async fixWeight( { currentWeight, resources }: WeightFixerParams<R>): Promise<number> {
    const limit = Number.MAX_SAFE_INTEGER / resources.length;

    return Math.min(currentWeight, limit);
  }
}
