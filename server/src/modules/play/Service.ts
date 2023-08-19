import { Episode, episodeToMediaElement } from "#modules/series/episode";
import { assertHasItems } from "#modules/utils/base/http/asserts";
import VLCService from "./PlayService";
import { MediaElement } from "./player";

type PlayOptions = {
  force?: boolean;
};
export default class PlayService {
  constructor(private vlcService: VLCService) {
  }

  async play(episodes: Episode[], options?: PlayOptions) {
    assertHasItems(episodes);

    const elements: MediaElement[] = episodes.map(episodeToMediaElement);
    const vlcServiceOptions = {
      openNewInstance: options?.force ?? false,
    };

    await this.vlcService.play(elements, vlcServiceOptions);
  }
}