import { Pickable, ResourceVO } from "#shared/models/resource";
import { secondsElapsedFrom } from "../utils";
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

export type Fx<R extends Pickable = Pickable> = (pickable: R, x: number)=> number;
type Params<R extends Pickable> = {
  fx: Fx<R>;
};
export default class LastTime<R extends ResourceVO = ResourceVO> implements WeightFixer<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async fixWeight( { resource }: WeightFixerParams<R>): Promise<number> {
    const secondsElapsed = secondsElapsedFrom(resource.lastTimePlayed ?? Number.MAX_SAFE_INTEGER);

    return this.#params.fx(resource, secondsElapsed);
  }
}