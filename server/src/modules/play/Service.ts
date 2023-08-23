import { Episode } from "#modules/episodes";
import { HistoryListService, streamWithHistoryListToHistoryList } from "#modules/historyLists";
import { StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { assertIsNotEmpty } from "#utils/validation";
import VLCService from "./PlayService";
import { episodeToMediaElement } from "./adapters";
import { MediaElement } from "./player";

type PlayParams = {
  force?: boolean;
  episodes: Episode[];
};
type Params = {
  vlcService: VLCService;
  streamWithHistoryListRepository: StreamWithHistoryListRepository;
  historyListService: HistoryListService;
};
export default class PlayService {
  #vlcService: VLCService;

  #streamWithHistoryListRepository: StreamWithHistoryListRepository;

  #historyService: HistoryListService;

  constructor( {vlcService, streamWithHistoryListRepository, historyListService}: Params) {
    this.#vlcService = vlcService;
    this.#streamWithHistoryListRepository = streamWithHistoryListRepository;
    this.#historyService = historyListService;
  }

  async play( {episodes, force}: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    const elements: MediaElement[] = episodes.map(episodeToMediaElement);
    const ok = await this.#vlcService.play(elements, {
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