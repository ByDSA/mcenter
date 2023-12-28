/* eslint-disable class-methods-use-this */
import { Resource } from "#shared/models/resource";
import Filter from "./Filter";

export default class PreventDisabledFilter implements Filter{
  // eslint-disable-next-line require-await
  async filter(episode: Resource): Promise<boolean> {
    return episode.disabled !== true;
  }
}