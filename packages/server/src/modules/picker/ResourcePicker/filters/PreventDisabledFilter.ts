/* eslint-disable class-methods-use-this */
import { ResourceVO } from "#shared/models/resource";
import Filter from "./Filter";

export default class PreventDisabledFilter implements Filter{
  // eslint-disable-next-line require-await
  async filter(episode: ResourceVO): Promise<boolean> {
    return episode.disabled !== true;
  }
}