/* eslint-disable class-methods-use-this */
import { Model } from "../../models";
import Filter from "./Filter";

export default class PreventDisabledFilter implements Filter<Model>{
  // eslint-disable-next-line require-await
  async filter(episode: Model): Promise<boolean> {
    return episode.disabled !== true;
  }
}