import { EpisodeRepository } from "#modules/episodes";
import LastTimePlayedService from "#modules/episodes/LastTimePlayedService";
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { Controller, SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";

type Params = {
  lastTimePlayedService: LastTimePlayedService;
  serieRepository: SerieRepository;
  episodeRepository: EpisodeRepository;
  historyListRepository: HistoryListRepository;
  streamRepository: StreamRepository;
};
export default class EpisodesUpdateLastTimePlayedController implements Controller {
  #lastTimePlayedService: LastTimePlayedService;

  #serieRepository: SerieRepository;

  #episodeRepository: EpisodeRepository;

  #historyListRepository: HistoryListRepository;

  #streamRepository: StreamRepository;

  constructor( {lastTimePlayedService, serieRepository, episodeRepository, historyListRepository, streamRepository}: Params) {
    this.#lastTimePlayedService = lastTimePlayedService;
    this.#serieRepository = serieRepository;
    this.#episodeRepository = episodeRepository;
    this.#historyListRepository = historyListRepository;
    this.#streamRepository = streamRepository;
  }

  async #action(req: Request, res: Response): Promise<void> {
    const series = await this.#serieRepository.getAll();
    const promisesToAwait = [];

    for (const serie of series) {
      const promise = this.#streamRepository.getManyBySerieId(serie.id).then(async streams => {
        const stream = streams[0];

        if (!stream) {
          console.log(`updateLastTimePlayed ignorado para ${serie.id}: No stream found`);

          return;
        }

        const historyList = await this.#historyListRepository.getOneByIdOrCreate(stream.id);

        await this.#episodeRepository.getAllBySerieId(serie.id).then(episodes => {
          for (const episode of episodes) {
            const updatePromise = this.#lastTimePlayedService.updateEpisodeLastTimePlayedFromEntriesAndGet( {
              episodeFullId: episode,
              entries: historyList.entries,
            } );

            promisesToAwait.push(updatePromise);
          }
        } );
      } );

      promisesToAwait.push(promise);
    }

    await Promise.all(promisesToAwait);

    res.sendStatus(200);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.#action.bind(this));

    return router;
  }
}