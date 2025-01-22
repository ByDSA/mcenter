import { Request, Response, Router } from "express";
import { EpisodeRepository } from "#modules/episodes";
import { HistoryListRepository, LastTimePlayedService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

const DepsMap = {
  lastTimePlayedService: LastTimePlayedService,
  serieRepository: SerieRepository,
  episodeRepository: EpisodeRepository,
  historyListRepository: HistoryListRepository,
  streamRepository: StreamRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class EpisodesUpdateLastTimePlayedController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async #action(_req: Request, res: Response): Promise<void> {
    const series = await this.#deps.serieRepository.getAll();
    const promisesToAwait = [];

    for (const serie of series) {
      const promise = this.#deps.streamRepository.getManyBySerieId(serie.id).then(async streams => {
        // eslint-disable-next-line prefer-destructuring
        const stream = streams[0];

        if (!stream) {
          console.log(`updateLastTimePlayed ignorado para ${serie.id}: No stream found`);

          return;
        }

        const historyList = await this.#deps.historyListRepository.getOneByIdOrCreate(stream.id);

        await this.#deps.episodeRepository.getAllBySerieId(serie.id).then(episodes => {
          for (const episode of episodes) {
            const updatePromise = this.#deps.lastTimePlayedService
              .updateEpisodeLastTimePlayedFromEntriesAndGet( {
                episodeId: episode.id,
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
