import { SerieRepository } from "#modules/series";
import { EpisodeGetAllRequest, EpisodeGetManyBySearchRequest, EpisodeGetOneByIdRequest, EpisodePatchOneByIdRequest, assertIsEpisodeGetAllRequest, assertIsEpisodeGetManyBySearchRequest, assertIsEpisodeGetOneByIdRequest, assertIsEpisodePatchOneByIdRequest } from "#shared/models/episodes";
import { Serie } from "#shared/models/series";
import { assertFound } from "#shared/utils/http/validation";
import { neverCase } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { validateReq } from "#utils/validation/zod-express";
import express, { Response, Router } from "express";
import { Model } from "../models";
import { Repository as EpisodeRepository } from "../repositories";

enum ResourceType {
  SERIES = "series",
}

const DepsMap = {
  episodeRepository: EpisodeRepository,
  serieRepo: SerieRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class RestController
implements
    Controller,
    CanGetOneById<EpisodeGetOneByIdRequest, Response>,
    CanGetAll<EpisodeGetAllRequest, Response>,
    CanPatchOneByIdAndGet<EpisodePatchOneByIdRequest, Response>
{
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async patchOneByIdAndGet(req: EpisodePatchOneByIdRequest, res: Response<any, Record<string, any>>): Promise<void> {
    const { episodeId, serieId } = req.params;
    const episodePartial = req.body;
    const id = {
      innerId: episodeId,
      serieId,
    };
    const got = await this.#deps.episodeRepository.patchOneByIdAndGet(id, episodePartial);

    assertFound(got);

    res.send(got);
  }

  async getAll(req: EpisodeGetAllRequest, res: Response): Promise<void> {
    const {serieId} = req.params;
    const got = await this.#deps.episodeRepository.getAllBySerieId(serieId);

    res.send(got);
  }

  async getOneById(
    req: EpisodeGetOneByIdRequest,
    res: Response,
  ): Promise<void> {
    const { episodeId, serieId } = req.params;
    const id = {
      innerId: episodeId,
      serieId,
    };
    const got = await this.#deps.episodeRepository.getOneById(id);

    assertFound(got);

    res.send(got);
  }

  async getManyBySearch(
    req: EpisodeGetManyBySearchRequest,
    res: Response,
  ): Promise<void> {
    const episodes = [];
    const filterPath = req.body.filter?.path;

    if (filterPath) {
      const splitted = filterPath.split("/");
      const type: ResourceType = splitted[0] as ResourceType;

      switch (type) {
        case ResourceType.SERIES: {
          const episode: Model | null = await this.#deps.episodeRepository.getOneByPath(filterPath);

          if (episode)
            episodes.push(episode);

          break;
        }
        default:
          neverCase(type);
      }
    }

    if (req.body.expand?.includes(ResourceType.SERIES)) {
      const series: {[serieId: string]: Serie} = {
      };

      for (const ep of episodes) {
        const {serieId} = ep.id;
        // TODO: quitar await en for
        const serie = series[serieId] ?? await this.#deps.serieRepo.getOneById(serieId);

        ep.serie = serie;

        series[serieId] = serie;
      }
    }

    res.send(episodes);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/:serieId",
      validateReq(assertIsEpisodeGetAllRequest),
      this.getAll.bind(this),
    );
    router.get("/:serieId/:episodeId",
      validateReq(assertIsEpisodeGetOneByIdRequest),
      this.getOneById.bind(this));

    router.options("/:serieId/:episodeId", (_, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );
    router.use(express.json());
    router.patch("/:serieId/:episodeId",
      validateReq(assertIsEpisodePatchOneByIdRequest),
      this.patchOneByIdAndGet.bind(this),
    );

    router.post(
      "/search",
      validateReq(assertIsEpisodeGetManyBySearchRequest),
      this.getManyBySearch.bind(this),
    );

    return router;
  }
}
