import { Episode } from "#modules/episodes";
import { HistoryListService, streamWithHistoryListToHistoryList } from "#modules/historyLists";
import { StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { PublicMethodsOf } from "#utils/types";
import { assertIsNotEmpty } from "#utils/validation";
import { episodeToMediaElement } from "./adapters";
import { MediaElement, PlayerService } from "./player";

type PlayParams = {
  force?: boolean;
  episodes: Episode[];
};
type Params = {
  playerService: PublicMethodsOf<PlayerService>;
  streamWithHistoryListRepository: StreamWithHistoryListRepository;
  historyListService: HistoryListService;
};
export default class PlayService {
  #playerService: PublicMethodsOf<PlayerService>;

  #streamWithHistoryListRepository: StreamWithHistoryListRepository;

  #historyService: HistoryListService;

  constructor( {playerService, streamWithHistoryListRepository, historyListService}: Params) {
    this.#playerService = playerService;
    this.#streamWithHistoryListRepository = streamWithHistoryListRepository;
    this.#historyService = historyListService;
  }

  async play( {episodes, force}: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    const elements: MediaElement[] = episodes.map(episodeToMediaElement);
    const ok = await this.#playerService.play(elements, {
      openNewInstance: force ?? false,
    } );

    if (ok) {
      for (const episode of episodes) {
        this.#streamWithHistoryListRepository.getOneById(episode.serieId)
          .then((streamWithHistoryList) => {
            if (streamWithHistoryList && episode) {
              this.#historyService.addEpisodeToHistory( {
                historyList: streamWithHistoryListToHistoryList(streamWithHistoryList),
                episode,
              } );
            }
          } );
      }
    }

    return ok;
  }
}