import { HistoryList, assertIsHistoryList } from "#modules/historyLists";
import { Episode, EpisodeRepository } from "../episodes";
import { Repository } from "./repositories";

type Params = {
  episodeRepository: EpisodeRepository;
  serieRepository: Repository;
};
export default class SerieService {
  #episodeRepository: EpisodeRepository;

  constructor( {episodeRepository}: Params) {
    this.#episodeRepository = episodeRepository;
  }

  async findLastEpisodeInHistoryList(historyList: HistoryList): Promise<Episode | null> {
    assertIsHistoryList(historyList);
    const lastEntry = historyList.entries.at(-1);

    if (!lastEntry)
      return null;

    const {episodeId} = lastEntry;

    return this.#episodeRepository.getOneById(episodeId);
  }
}