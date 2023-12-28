import { Pickable } from "#shared/models/resource";
import { secondsElapsedFrom } from "../utils";
import Filter from "./Filter";

type Params = {
  minSecondsElapsed: number;
  lastTimePlayed: number;
};
export default class PreventRepeatInTimeFilter implements Filter {
  #params: Params;

  constructor(params: Params) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(_: Pickable): Promise<boolean> {
    const secondsElapsed = secondsElapsedFrom(this.#params.lastTimePlayed);

    return secondsElapsed >= this.#params.minSecondsElapsed;
  }
}