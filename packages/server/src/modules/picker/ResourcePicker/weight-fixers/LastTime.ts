import { Pickable, ResourceVO } from "#modules/resources/models";
import { secondsElapsedFrom } from "../utils";
import { WeightFixer, WeightFixerParams } from "./WeightFixer";

export type Fx<R extends Pickable = Pickable> = (pickable: R, x: number)=> number;
type Params<R extends Pickable> = {
  fx: Fx<R>;
};
export class LastTimeWeightFixer<R extends ResourceVO = ResourceVO> implements WeightFixer<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async fixWeight( { resource }: WeightFixerParams<R>): Promise<number> {
    let secondsElapsed;

    if (resource.lastTimePlayed) {
      secondsElapsed = secondsElapsedFrom(resource.lastTimePlayed);

      if (secondsElapsed < 0)
        secondsElapsed = 0;
    } else
      secondsElapsed = Infinity;

    return this.#params.fx(resource, secondsElapsed);
  }
}
