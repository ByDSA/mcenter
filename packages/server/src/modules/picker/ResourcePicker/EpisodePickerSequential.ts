import { Model, compareFullId } from "../models";
import EpisodePicker from "./EpisodePicker";

type Params = {
  episodes: Model[];
  lastEp?: Model;
};
export default class SequentialPicker implements EpisodePicker {
  #episodes: Model[];

  #lastEp: Model | undefined;

  constructor( {episodes, lastEp}: Params) {
    this.#episodes = episodes;
    this.#lastEp = lastEp;
  }

  // eslint-disable-next-line require-await
  async pick(n: number = 1): Promise<Model[]> {
    let index = -1;
    const ret: Model[] = [];

    if (this.#lastEp)
      index = this.#episodes.findIndex((e) => compareFullId(e, this.#lastEp as Model));

    for (let i = 0; i < n; i++) {
      index = (index + 1) % this.#episodes.length;
      ret.push(this.#episodes[index]);
    }

    return ret;
  }
}