import { isDefined } from "#shared/utils/validation";
import { Model, ModelFullId, compareFullId } from "../../models";
import Filter from "./Filter";

type Params = {
  lastEp: Model | null;
  firstEpisodeFullId: ModelFullId;
  secondEpisodeFullId: ModelFullId;
};
export default class DependencyFilter implements Filter<Model> {
  #lastEp: Model | null;

  #firstEpisodeFullId: ModelFullId;

  #secondEpisodeFullId: ModelFullId;

  constructor( {lastEp,
    firstEpisodeFullId,
    secondEpisodeFullId}: Params) {
    this.#lastEp = lastEp;
    this.#firstEpisodeFullId = firstEpisodeFullId;
    this.#secondEpisodeFullId = secondEpisodeFullId;
  }

  // eslint-disable-next-line require-await
  async filter(self: Model): Promise<boolean> {
    if (!isDefined(this.#lastEp))
      return true;

    if (compareFullId(this.#lastEp, this.#firstEpisodeFullId))
      return compareFullId(self, this.#secondEpisodeFullId);

    return true;
  }
}