import { HistoryList, assertIsHistoryList } from "#modules/historyLists";
import { Episode, EpisodeRepository } from "../episodes";
import { Repository } from "./repositories";

type Params = {
  episodeRepository: EpisodeRepository;
  serieRepository: Repository;
};
export default class SerieService {
  #episodeRepository: EpisodeRepository;

  #serieRepository: Repository;

  constructor( {episodeRepository, serieRepository}: Params) {
    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;
  }

  async findLastEpisodeInHistoryList(historyList: HistoryList): Promise<Episode | null> {
    assertIsHistoryList(historyList);
    const lastEntry = historyList.entries.at(-1);

    if (!lastEntry)
      return null;

    const {episodeId} = lastEntry;
    const serie = await this.#serieRepository.getOneById(lastEntry.serieId);

    if (!serie)
      return null;

    return this.#episodeRepository.getOneById( {
      episodeId,
      serieId: serie.id,
    } );
  }
}