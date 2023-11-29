import { EpisodeRepository } from "#modules/episodes";
import { SerieRelationshipWithStreamFixer, SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { FullResponse, LogElementResponse } from "#shared/utils/http";
import { Controller, SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";

type Params = {
  streamRepository: StreamRepository;
  serieRepository: SerieRepository;
  episodeRepository: EpisodeRepository;
  serieRelationshipWithStreamFixer: SerieRelationshipWithStreamFixer;
};
export default class FixerController implements Controller {
  #episodeRepository: EpisodeRepository;

  #serieRepository: SerieRepository;

  #streamRepository: StreamRepository;

  #serieRelationshipWithStreamFixer: SerieRelationshipWithStreamFixer;

  constructor( {episodeRepository,serieRepository,streamRepository, serieRelationshipWithStreamFixer}: Params) {
    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;
    this.#streamRepository = streamRepository;
    this.#serieRelationshipWithStreamFixer = serieRelationshipWithStreamFixer;
  }

  async endpoint(_: Request, res: Response) {
    const actions: LogElementResponse[] = [];

    actions.push(...await this.fixSeries());

    const responseElement: FullResponse<LogElementResponse[]> = {
      data: actions,
    };

    res.send(responseElement);
  }

  async fixSeries(): Promise<LogElementResponse[]> {
    const actions: LogElementResponse[] = [];
    const series = await this.#serieRepository.getAll();
    const promises: Promise<LogElementResponse | null>[] = [];

    for (const serie of series) {
      const promise = this.#serieRelationshipWithStreamFixer.fixDefaultStreamForSerie(serie.id);

      promises.push(promise);
    }

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result)
        actions.push(result);
    }

    return actions;
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.endpoint.bind(this));

    return router;
  }
}