import { Resource } from "#modules/resources/models";
import { Filter } from "./Filter";

export class PreventDisabledFilter implements Filter {
  // eslint-disable-next-line require-await
  async filter(episode: Resource): Promise<boolean> {
    return episode.disabled !== true;
  }
}
