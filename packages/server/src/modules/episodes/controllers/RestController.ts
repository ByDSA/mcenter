import { assertFound } from "#shared/utils/http/validation";
import { neverCase } from "#shared/utils/validation";
import express, { Response, Router } from "express";
import { EpisodeRepository } from "../repositories";
import { Episode } from "#episodes/models";
import { EpisodeGetAllRequest, EpisodeGetManyBySearchRequest, EpisodeGetOneByIdRequest, EpisodePatchOneByIdRequest, EpisodePatchOneByIdResBody, assertIsEpisodeGetAllRequest, assertIsEpisodeGetManyBySearchRequest, assertIsEpisodeGetOneByIdRequest, assertIsEpisodePatchOneByIdRequest, assertIsEpisodePatchOneByIdResBody } from "#episodes/models/transport";
import { SerieRepository } from "#modules/series";
import { Serie } from "#modules/series/models";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { ResponseWithBody, validateReq } from "#utils/validation/zod-express";

enum ResourceType {
  SERIES = "series",
}

const DEPS_MAP = {
  episodeRepository: EpisodeRepository,
  serieRepo: SerieRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class EpisodesRestController
implements
    Controller,
    CanGetOneById<EpisodeGetOneByIdRequest, Response>,
    CanGetAll<EpisodeGetAllRequest, Response>,
    CanPatchOneByIdAndGet<
    EpisodePatchOneByIdRequest,
     ResponseWithBody<EpisodePatchOneByIdResBody>
     > {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async patchOneByIdAndGet(
    req: EpisodePatchOneByIdRequest,
    res: ResponseWithBody<EpisodePatchOneByIdResBody>,
  ): Promise<void> {
    const { episodeId, serieId } = req.params;
    const episodePartial = req.body;
    const id = {
      innerId: episodeId,
      serieId,
    };
    const got = await this.#deps.episodeRepository.patchOneByIdAndGet(id, episodePartial.entity);

    assertFound(got);
    const body: EpisodePatchOneByIdResBody = {
      entity: got ?? undefined,
    };

    try {
      assertIsEpisodePatchOneByIdResBody(body);
    } catch {
      res.status(501).send(body);
    }
    res.send(body);
  }

  async getAll(req: EpisodeGetAllRequest, res: Response): Promise<void> {
    const { serieId } = req.params;
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
          const episode: Episode | null = await this.#deps.episodeRepository
            .getOneByPath(filterPath);

          if (episode)
            episodes.push(episode);

          break;
        }
        default:
          neverCase(type);
      }
    }

    if (req.body.expand?.includes(ResourceType.SERIES)) {
      const series: {[serieId: string]: Serie} = {};

      for (const ep of episodes) {
        const { serieId } = ep.id;
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

    router.get(
      "/:serieId",
      validateReq(assertIsEpisodeGetAllRequest),
      this.getAll.bind(this),
    );
    router.get(
      "/:serieId/:episodeId",
      validateReq(assertIsEpisodeGetOneByIdRequest),
      this.getOneById.bind(this),
    );

    router.options("/:serieId/:episodeId", (_, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );
    router.use(express.json());
    router.patch(
      "/:serieId/:episodeId",
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
