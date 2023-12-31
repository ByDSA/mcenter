import { ResourceVO } from "#shared/models/resource";
import { secondsElapsedFrom } from "../utils";
import Filter from "./Filter";

type Params = {
  minSecondsElapsed: number;
};
export default class PreventRepeatInTimeFilter implements Filter<ResourceVO> {
  #params: Params;

  constructor(params: Params) {
    this.#params = params;
  }

  // eslint-disable-next-line require-await
  async filter(resource: ResourceVO): Promise<boolean> {
    if (resource.lastTimePlayed === undefined || resource.lastTimePlayed <= 0)
      return true;

    const secondsElapsed = secondsElapsedFrom(resource.lastTimePlayed);

    return secondsElapsed > this.#params.minSecondsElapsed;
  }
}