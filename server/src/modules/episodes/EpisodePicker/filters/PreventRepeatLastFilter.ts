/* eslint-disable class-methods-use-this */
import { isDefined } from "#utils/validation";
import { Model, ModelFullId, compareFullId } from "../../models";
import Filter from "./Filter";

export default class PreventRepeatLastFilter implements Filter<Model>{
  #lastEp: ModelFullId | undefined;

  constructor(lastEp: ModelFullId | undefined) {
    this.#lastEp = lastEp;
  }

  // eslint-disable-next-line require-await
  async filter(episode: Model): Promise<boolean> {
    if (!isDefined(this.#lastEp))
      return true;

    if (!compareFullId(this.#lastEp, episode))
      return true;

    return false;
  }
}