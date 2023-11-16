/* eslint-disable no-await-in-loop */
import { Episode } from "#shared/models/episodes";
import { PublicMethodsOf } from "#shared/utils/types";
import { assertIsNotEmpty } from "#shared/utils/validation";
import { episodeToMediaElement } from "./adapters";
import { MediaElement, PlayerService } from "./player";

type PlayParams = {
  force?: boolean;
  episodes: Episode[];
};
type Params = {
  playerService: PublicMethodsOf<PlayerService>;
};
export default class PlayService {
  #playerService: PublicMethodsOf<PlayerService>;

  constructor( {playerService}: Params) {
    this.#playerService = playerService;
  }

  async play( {episodes, force}: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    const elements: MediaElement[] = episodes.map(episodeToMediaElement);
    const ok = await this.#playerService.play(elements, {
      openNewInstance: force ?? false,
    } );

    return ok;
  }
}