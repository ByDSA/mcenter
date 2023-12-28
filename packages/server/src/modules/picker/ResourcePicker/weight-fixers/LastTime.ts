import { Pickable } from "#shared/models/resource";
import { secondsElapsedFrom } from "../utils";
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

type Params = {
  lastTimePicked: number;
  fx: (pickable: Pickable, x: number)=> number;
};
export default class LastTimeWeightFixer implements WeightFixer {
  #params: Params;

  constructor(params: Params) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async fixWeight( { resource }: WeightFixerParams): Promise<number> {
    const secondsElapsed = secondsElapsedFrom(this.#params.lastTimePicked);

    return this.#params.fx(resource, secondsElapsed);
  }
}