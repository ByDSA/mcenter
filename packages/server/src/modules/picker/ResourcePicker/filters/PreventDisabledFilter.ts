import { Filter } from "./Filter";
import { ResourceVO } from "#modules/resources/models";

export class PreventDisabledFilter implements Filter {
  // eslint-disable-next-line require-await
  async filter(episode: ResourceVO): Promise<boolean> {
    return episode.disabled !== true;
  }
}
