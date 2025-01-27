import { FullResponse, LogElementResponse } from "#shared/utils/http";
import { Request, Response, Router } from "express";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams/repositories";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

const DEPS_MAP = {
  serieRepository: SerieRepository,
  streamRepository: StreamRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class FixerController implements Controller {
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
