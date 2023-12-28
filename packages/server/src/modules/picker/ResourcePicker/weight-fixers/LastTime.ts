import { Pickable } from "#shared/models/resource";
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

type Params = {
  lastTimePicked: number;
  fx: (pickable: Pickable, x: number) => number;
}
export default class LastTimeWeightFixer implements WeightFixer {
  #params: Params;
  constructor(params: Params) {
    this.#params = params;
  }

  async fixWeight( { resource }: WeightFixerParams): Promise<number> {
    const secondsEllapsed = Date.now()/1000 - this.#params.lastTimePicked;
    return this.#params.fx(resource, secondsEllapsed);
  }
}