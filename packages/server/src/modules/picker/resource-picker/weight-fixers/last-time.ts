import { dateToTimestampInSeconds } from "$shared/utils/time/timestamp";
import { secondsElapsedFrom } from "../utils";
import { WeightFixer, WeightFixerParams } from "./weight-fixer";

export type Fx<R> = (pickable: R, x: number)=> number;
type Params<R> = {
  fx: Fx<R>;
};
export abstract class LastTimeWeightFixer<R> implements WeightFixer<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async fixWeight( { resource }: WeightFixerParams<R>): Promise<number> {
    let secondsElapsed;
    const lastTimePlayed = this.getLastTimePlayed(resource);

    if ((lastTimePlayed?.getTime() ?? 0) > 0) {
      secondsElapsed = secondsElapsedFrom(dateToTimestampInSeconds(lastTimePlayed!));

      if (secondsElapsed < 0)
        secondsElapsed = 0;
    } else
      secondsElapsed = Infinity;

    return this.#params.fx(resource, secondsElapsed);
  }

  abstract getLastTimePlayed(r: R): Date | null;
}
