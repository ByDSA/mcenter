import { EpisodeRepository } from "#modules/episodes";
import { SerieRepository } from "#modules/series";
import { EpisodeGetAllRequest, EpisodeGetManyBySearchRequest, EpisodeGetOneByIdRequest, EpisodePatchOneByIdRequest } from "#shared/models/episodes";
import { Serie } from "#shared/models/series";
import { assertFound } from "#shared/utils/http/validation";
import { PublicMethodsOf } from "#shared/utils/types";
import { neverCase } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/controller";
import express, { Response, Router } from "express";
import { Model } from "../models";
import {getAllValidation,
  getManyBySearchValidation,
  getOneByIdValidation,
  patchOneByIdValidation} from "./validation";

enum ResourceType {
  SERIES = "series",
}

type Params = {
  episodeRepository: PublicMethodsOf<EpisodeRepository>;
  serieRepo: PublicMethodsOf<SerieRepository>;
};
export default class RestController
implements
    Controller,
    CanGetOneById<EpisodeGetOneByIdRequest, Response>,
    CanGetAll<EpisodeGetAllRequest, Response>,
    CanPatchOneByIdAndGet<EpisodePatchOneByIdRequest, Response>
{
  #episodeRepository: PublicMethodsOf<EpisodeRepository>;

  #serieRepo: PublicMethodsOf<SerieRepository>;

  constructor( {episodeRepository, serieRepo}: Params) {
    this.#episodeRepository = episodeRepository;
    this.#serieRepo = serieRepo;
  }

  async patchOneByIdAndGet(req: EpisodePatchOneByIdRequest, res: Response<any, Record<string, any>>): Promise<void> {
    const { episodeId, serieId } = req.params;
    const episodePartial = req.body;
    const id = {
      episodeId,
      serieId,
    };
    const got = await this.#episodeRepository.patchOneByIdAndGet(id, episodePartial);

    assertFound(got);

    res.send(got);
  }

  async getAll(req: EpisodeGetAllRequest, res: Response): Promise<void> {
    const {serieId} = req.params;
    const got = await this.#episodeRepository.getAllBySerieId(serieId);

    res.send(got);
  }

  async getOneById(
    req: EpisodeGetOneByIdRequest,
    res: Response,
  ): Promise<void> {
    const { episodeId, serieId } = req.params;
    const id = {
      episodeId,
      serieId,
    };
    const got = await this.#episodeRepository.getOneById(id);

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
          const episode: Model | null = await this.#episodeRepository.getOneByPath(filterPath);

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
        const {serieId} = ep;
        // eslint-disable-next-line no-await-in-loop
        const serie = series[serieId] ?? await this.#serieRepo.getOneById(serieId);

        ep.serie = serie;

        series[serieId] = serie;
      }
    }

    res.send(episodes);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/:serieId", getAllValidation, this.getAll.bind(this));
    router.get("/:serieId/:episodeId", getOneByIdValidation, this.getOneById.bind(this));

    router.options("/:serieId/:episodeId", (_, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );
    router.use(express.json());
    router.patch("/:serieId/:episodeId", patchOneByIdValidation, this.patchOneByIdAndGet.bind(this));

    router.post(
      "/search",
      getManyBySearchValidation,
      this.getManyBySearch.bind(this),
    );

    return router;
  }
}
