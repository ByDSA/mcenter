import { Request, Response, Router } from "express";
import { EpisodeRepository } from "#episodes/index";
import { HistoryListRepository, LastTimePlayedService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams/repositories";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

const DEPS_MAP = {
  lastTimePlayedService: LastTimePlayedService,
  serieRepository: SerieRepository,
  episodeRepository: EpisodeRepository,
  historyListRepository: HistoryListRepository,
  streamRepository: StreamRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class EpisodesUpdateLastTimePlayedController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async #action(_req: Request, res: Response): Promise<void> {
    const series = await this.#deps.serieRepository.getAll();
    const promisesToAwait = [];

    for (const serie of series) {
      const promise = this.#deps.streamRepository.getManyBySerieId(serie.id).then(async streams => {
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
