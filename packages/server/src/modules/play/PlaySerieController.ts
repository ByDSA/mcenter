import { EpisodeRepository } from "#modules/episodes";
import { HistoryListService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { assertFound } from "#shared/utils/http/validation";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Request, Response, Router } from "express";
import PlayService from "./PlayService";

const DepsMap = {
  serieRepository: SerieRepository,
  episodeRepository: EpisodeRepository,
  playService: PlayService,
  historyListService: HistoryListService,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class PlaySerieController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async playSerie(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id: innerId, name: serieId } = req.params;
    const serie = await this.#deps.serieRepository.getOneById(serieId);

    assertFound(serie);

    const episode = await this.#deps.episodeRepository.getOneById( {
      serieId,
      innerId,
    } );

    assertFound(episode);
    const ok = await this.#deps.playService.play( {
      episodes: [episode],
      force,
    } );

    if (ok) {
      await this.#deps.historyListService.addEpisodesToHistory( {
        historyListId: serie.id,
        episodes: [episode],
      } );
    } else
      console.log("PlayService: Could not play");

    res.send(episode);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/:name/:id", this.playSerie.bind(this));

    return router;
  }
}