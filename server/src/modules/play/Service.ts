import { HistoryRepository } from "#modules/history";
import { EpisodeWithSerie } from "#modules/series/episode";
import { StreamRepository } from "#modules/stream";
import { assertHasItems } from "#modules/utils/base/http/asserts";
import VLCService from "./PlayService";
import { episodeToMediaElement } from "./adapters";
import { MediaElement } from "./player";

type PlayParams = {
  force?: boolean;
  episodes: EpisodeWithSerie[];
};
type Params = {
  vlcService: VLCService;
  streamRepository: StreamRepository;
  historyRepository: HistoryRepository;
};
export default class PlayService {
  #vlcService: VLCService;

  #streamRepository: StreamRepository;

  #historyRepository: HistoryRepository;

  constructor( {vlcService, streamRepository, historyRepository}: Params) {
    this.#vlcService = vlcService;
    this.#streamRepository = streamRepository;
    this.#historyRepository = historyRepository;
  }

  async play( {episodes, force}: PlayParams): Promise<boolean> {
    assertHasItems(episodes);

    const elements: MediaElement[] = episodes.map(episodeToMediaElement);
    const ok = await this.#vlcService.play(elements, {
      openNewInstance: force ?? false,
    } );

    if (ok) {
      for (const episode of episodes) {
        this.#streamRepository.findOneById(episode.serie.id)
          .then((stream) => {
            if (stream && episode)
              this.#historyRepository.addToHistory(stream, episode);
          } );}
    }

    return ok;
  }
}