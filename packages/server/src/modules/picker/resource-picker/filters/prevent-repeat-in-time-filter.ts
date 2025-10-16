import { secondsElapsedFrom } from "../utils";
import { Filter } from "./filter";

type Params = {
  minSecondsElapsed: number;
};
export abstract class PreventRepeatInTimeFilter<R> implements Filter<R> {
  #params: Params;

  constructor(params: Params) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(self: R): Promise<boolean> {
    const lastTimePlayed = this.getLastTimePlayed(self);

    if (lastTimePlayed === undefined || lastTimePlayed <= 0)
      return true;

    const { minSecondsElapsed } = this.#params;
    const secondsElapsed = secondsElapsedFrom(lastTimePlayed);

    return secondsElapsed >= minSecondsElapsed;
  }

  abstract getLastTimePlayed(self: R): number;
}
