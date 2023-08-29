import { Episode } from "#modules/episodes";
import { HistoryList, HistoryListRepository, HistoryListService } from "#modules/historyLists";
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
  historyListRepository: HistoryListRepository;
  historyListService: HistoryListService;
};
export default class PlayService {
  #playerService: PublicMethodsOf<PlayerService>;

  #historyListRepository: HistoryListRepository;

  #historyService: HistoryListService;

  constructor( {playerService, historyListRepository, historyListService}: Params) {
    this.#playerService = playerService;
    this.#historyListRepository = historyListRepository;
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
        if (!episode)
          // eslint-disable-next-line no-continue
          continue;

        const historyListId = episode.serieId;

        this.#historyListRepository.getOneById(historyListId)
          .then((historyList: HistoryList | null) => {
            if (!historyList)
              return;

            this.#historyService.addEpisodeToHistory( {
              historyList,
              episode,
            } );
          } );
      }
    }

    return ok;
  }
}