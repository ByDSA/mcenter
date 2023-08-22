import { Serie } from "#modules/series";
import { SerieWithEpisodesRepository, serieWithEpisodesToSerie } from "#modules/seriesWithEpisodes";
import { StreamWithHistoryListRepository, StreamWithHistoryListService } from "#modules/streamsWithHistoryList";
import { assertFound } from "#utils/http/validation";
import { assertIsDefined } from "#utils/validation";
import { Request, Response, Router } from "express";
import Service from "./Service";

type Params = {
  playService: Service;
  streamWithHistoryListService: StreamWithHistoryListService;
  streamWithHistoryListRepository: StreamWithHistoryListRepository;
  serieWithEpisodesRepository: SerieWithEpisodesRepository;
};
export default class PlayController {
  #streamRepository: StreamWithHistoryListRepository;

  #streamWithHistoryListService: StreamWithHistoryListService;

  #playService: Service;

  #serieRepository: SerieWithEpisodesRepository;

  constructor( {streamWithHistoryListRepository: streamRepository, streamWithHistoryListService: streamService, playService: service, serieWithEpisodesRepository: serieRepository}: Params) {
    this.#playService = service;
    this.#streamRepository = streamRepository;
    this.#streamWithHistoryListService = streamService;
    this.#serieRepository = serieRepository;
  }

  async playStream(req: Request, res: Response) {
    console.log("playStream");
    const { id, number, force } = validateParams(req);
    const stream = await this.#streamRepository.getOneById(id);

    assertFound(stream);

    const episodes = await this.#streamWithHistoryListService.pickNextEpisode(stream, number);
    const serieWithEpisodes = await this.#serieRepository.getOneById(stream.id);

    assertFound(serieWithEpisodes);

    const serie: Serie = serieWithEpisodesToSerie(serieWithEpisodes);
    const episodeWithSerie = episodes.map((episode) => ( {
      ...episode,
      serie,
    } ));

    await this.#playService.play( {
      episodes: episodeWithSerie,
      force,
    } );

    res.send(episodes);
  }

  getRouter(): Router {
    const router = Router();

    router.get("/:id/:number?", this.playStream.bind(this));

    return router;
  }
}

function validateParams(req: Request) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id } = req.params;
  const number = +(req.params.number ?? 1);

  assertIsDefined(id);

  return {
    id,
    number,
    force,
  };
}