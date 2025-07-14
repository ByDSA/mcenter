import { Resource } from "#modules/resources/models";
import { secondsElapsedFrom } from "../utils";
import { Filter } from "./Filter";

type Params = {
  minSecondsElapsed: number;
};
export class PreventRepeatInTimeFilter implements Filter<Resource> {
  #params: Params;

  constructor(params: Params) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(resource: Resource): Promise<boolean> {
    if (resource.lastTimePlayed === undefined || resource.lastTimePlayed <= 0)
      return true;

    const { minSecondsElapsed } = this.#params;
    const secondsElapsed = secondsElapsedFrom(resource.lastTimePlayed);

    return secondsElapsed >= minSecondsElapsed;
  }
}
