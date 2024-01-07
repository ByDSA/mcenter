import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { FullResponse, LogElementResponse } from "#shared/utils/http";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Request, Response, Router } from "express";

const DepsMap = {
  serieRepository: SerieRepository,
  streamRepository: StreamRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class FixerController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
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
    const series = await this.#deps.serieRepository.getAll();
    const promises: Promise<LogElementResponse | null>[] = [];

    for (const serie of series) {
      const promise = this.#deps.streamRepository.fixDefaultStreamForSerie(serie.id);

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