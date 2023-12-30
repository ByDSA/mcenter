import { Pickable } from "#shared/models/resource";
import { secondsElapsedFrom } from "../utils";
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

type Params<R extends Pickable> = {
  getLastTimePicked: (pickable: R)=> number;
  fx: (pickable: R, x: number)=> number;
};
export default class LastTimeWeightFixer<R extends Pickable = Pickable> implements WeightFixer<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async fixWeight( { resource }: WeightFixerParams<R>): Promise<number> {
    const secondsElapsed = secondsElapsedFrom(this.#params.getLastTimePicked(resource));

    return this.#params.fx(resource, secondsElapsed);
  }
}