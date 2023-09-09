import { EpisodeRepository } from "#modules/episodes";
import LastTimePlayedService from "#modules/episodes/LastTimePlayedService";
import { HistoryList, HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { Controller, SecureRouter } from "#utils/express";
import { assertFound } from "#utils/http/validation";
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

        const historyList: HistoryList | null = await this.#historyListRepository.getOneById(stream.id);

        assertFound(historyList, "History list not found");
        await this.#episodeRepository.getAllBySerieId(serie.id).then(episodes => {
          for (const episode of episodes) {
            const updatePromise = this.#lastTimePlayedService.updateEpisodeLastTimePlayedAndGetFromHistoryList( {
              episode,
              historyList,
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