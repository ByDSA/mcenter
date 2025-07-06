import { assertFound } from "#shared/utils/http/validation";
import { neverCase } from "#shared/utils/validation";
import express, { Response, Router } from "express";
import { z } from "zod";
import { Episode } from "#episodes/models";
import { getAll, getManyBySearch, getOneById, patchOneById } from "#episodes/models/dto";
import { SerieRepository } from "#modules/series";
import { Serie } from "#modules/series/models";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { ResponseWithBody, validateReq } from "#utils/validation/zod-express";
import { EpisodeRepository } from "../repositories";
import { assertZod } from "#sharedSrc/utils/validation/zod";

type EpisodeGetOneByIdRequest = {
  params: z.infer<typeof getOneById.paramsSchema>;
};

type EpisodeGetAllRequest = {
  params: z.infer<typeof getAll.paramsSchema>;
};

type EpisodePatchOneByIdRequest = {
  params: z.infer<typeof patchOneById.reqParamsSchema>;
  body: z.infer<typeof patchOneById.reqBodySchema>;
};

type EpisodePatchOneByIdResBody = z.infer<typeof patchOneById.resSchema>;

type EpisodeGetManyBySearchRequest = {
  body: z.infer<typeof getManyBySearch.reqBodySchema>;
};

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
      assertZod(patchOneById.resSchema, body);
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

    router.options("/:serieId/:episodeId", (_, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );
    router.use(express.json());

    router.get(
      "/:serieId",
      validateReq((req: EpisodeGetAllRequest) => {
        assertZod(getAll.paramsSchema, req.params);

        return req;
      } ),
      this.getAll.bind(this),
    );
    router.get(
      "/:serieId/:episodeId",
      validateReq((req: EpisodeGetOneByIdRequest) => {
        assertZod(getOneById.paramsSchema, req.params);

        return req;
      } ),
      this.getOneById.bind(this),
    );

    router.patch(
      "/:serieId/:episodeId",
      validateReq((req: EpisodePatchOneByIdRequest) => {
        assertZod(patchOneById.reqParamsSchema, req.params);
        assertZod(patchOneById.reqBodySchema, req.body);

        return req;
      } ),
      this.patchOneByIdAndGet.bind(this),
    );

    router.post(
      "/search",
      validateReq((req: EpisodeGetManyBySearchRequest) => {
        assertZod(getManyBySearch.reqBodySchema, req.body);

        return req;
      } ),
      this.getManyBySearch.bind(this),
    );

    return router;
  }
}
