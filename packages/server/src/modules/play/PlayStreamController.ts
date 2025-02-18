import { assertFound } from "#shared/utils/http/validation";
import { assertIsDefined } from "#shared/utils/validation";
import { Request, Response, Router } from "express";
import { PlayService } from "./PlayService";
import { EpisodePickerService } from "#modules/episode-picker";
import { HistoryListService } from "#modules/historyLists";
import { StreamRepository } from "#modules/streams/repositories";
import { Controller } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

const DEPS_MAP = {
  playService: PlayService,
  episodePickerService: EpisodePickerService,
  streamRepository: StreamRepository,
  historyListService: HistoryListService,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class PlayStreamController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async playStream(req: Request, res: Response) {
    const { id, number, force } = validateParams(req);
    const stream = await this.#deps.streamRepository.getOneById(id);

    assertFound(stream);

    const episodes = await this.#deps.episodePickerService.getByStream(stream, number);
    const ok = await this.#deps.playService.play( {
      episodes,
      force,
    } );

    if (ok) {
      await this.#deps.historyListService.addEpisodesToHistory( {
        historyListId: stream.id,
        episodes,
      } );
    } else
      console.log("PlayService: Could not play");

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
