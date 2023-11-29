import { EpisodeRepository } from "#modules/episodes";
import { HistoryListService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { assertFound } from "#shared/utils/http/validation";
import { Controller, SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";
import PlayService from "./PlayService";

type Params = {
  serieRepository: SerieRepository;
  episodeRepository: EpisodeRepository;
  playService: PlayService;
  historyListService: HistoryListService;
};
export default class PlaySerieController implements Controller {
  #serieRepository: SerieRepository;

  #episodeRepository: EpisodeRepository;

  #playService: PlayService;

  #historyListService: HistoryListService;

  constructor( {serieRepository, playService, episodeRepository, historyListService}: Params) {
    this.#serieRepository = serieRepository;
    this.#episodeRepository = episodeRepository;
    this.#playService = playService;
    this.#historyListService = historyListService;
  }

  async playSerie(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id: episodeId, name: serieId } = req.params;
    const serie = await this.#serieRepository.getOneById(serieId);

    assertFound(serie);

    const episode = await this.#episodeRepository.getOneById( {
      serieId,
      episodeId,
    } );

    assertFound(episode);
    const ok = await this.#playService.play( {
      episodes: [episode],
      force,
    } );

    if (ok) {
      await this.#historyListService.addEpisodesToHistory( {
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