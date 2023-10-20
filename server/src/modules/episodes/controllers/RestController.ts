import { EpisodeRepository } from "#modules/episodes";
import { EpisodeGetAllRequest, EpisodeGetOneByIdRequest, EpisodePatchOneByIdRequest } from "#shared/models/episodes";
import { PublicMethodsOf } from "#shared/utils/types";
import { Controller, SecureRouter } from "#utils/express";
import { assertFound } from "#utils/http/validation";
import { CanGetAll, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/controller";
import express, { Response, Router } from "express";
import {getAllValidation,
  getOneByIdValidation,
  patchOneByIdValidation} from "./validation";

type Params = {
  episodeRepository: PublicMethodsOf<EpisodeRepository>;
};
export default class RestController
implements
    Controller,
    CanGetOneById<EpisodeGetOneByIdRequest, Response>,
    CanGetAll<EpisodeGetAllRequest, Response>,
    CanPatchOneByIdAndGet<EpisodePatchOneByIdRequest, Response>
{
  #episodeRepository: PublicMethodsOf<EpisodeRepository>;

  constructor( {episodeRepository}: Params) {
    this.#episodeRepository = episodeRepository;
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

    return router;
  }
}
