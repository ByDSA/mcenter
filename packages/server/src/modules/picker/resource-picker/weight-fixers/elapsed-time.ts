import { dateToTimestampInSeconds } from "$shared/utils/time/timestamp";
import { secondsElapsedFrom } from "../utils";
import { WeightFixer, WeightFixerParams } from "./weight-fixer";

type FxParams<R> = {
  resource: R;
  elapsedSeconds: number;
};
export type Fx<R> = (params: FxParams<R>)=> number;
type Params<R> = {
  fx: Fx<R>;
};
export abstract class ElapsedTimeWeightFixer<R> implements WeightFixer<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async fixWeight( { resource }: WeightFixerParams<R>): Promise<number> {
    let elapsedSeconds;
    const lastTimePlayed = this.getLastTimePlayed(resource);

    if ((lastTimePlayed?.getTime() ?? 0) > 0) {
      elapsedSeconds = secondsElapsedFrom(dateToTimestampInSeconds(lastTimePlayed!));

      if (elapsedSeconds < 0)
        elapsedSeconds = 0;
    } else
      elapsedSeconds = Infinity;

    return this.#params.fx( {
      resource,
      elapsedSeconds,
    } );
  }

  abstract getLastTimePlayed(r: R): Date | null;
}
