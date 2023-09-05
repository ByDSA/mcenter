import { EpisodeRepository } from "#modules/episodes";
import { HistoryListService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { Controller, SecureRouter } from "#utils/express";
import { assertFound } from "#utils/http/validation";
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

    const episodes = await this.#episodeRepository.getManyBySerieId(serieId);
    const episode = episodes.find((e) => e.episodeId === episodeId);

    assertFound(episode);
    const ok = await this.#playService.play( {
      episodes: [episode],
      force,
    } );

    if (ok) {
      await this.#historyListService.addEpisodesToHistory( {
        historyListId: serie.id,
        episodes,
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