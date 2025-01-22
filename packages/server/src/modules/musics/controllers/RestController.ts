import { Music, MusicGetOneByIdReq, MusicPatchOneByIdReq, MusicPatchOneByIdResBody, assertIsMusic, assertIsMusicGetOneByIdReq, assertIsMusicPatchOneByIdReq, assertIsMusicPatchOneByIdResBody } from "#shared/models/musics";
import { HttpStatusCode } from "#shared/utils/http";
import express, { NextFunction, Router } from "express";
import { Repository } from "../repositories";
import { PatchOneParams } from "../repositories/types";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetOneById, CanPatchOneById } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { ResponseWithBody, sendBody, validateReq, validateResBody } from "#utils/validation/zod-express";

const DepsMap = {
  repo: Repository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class RestController
implements
    Controller,
    CanGetOneById<MusicGetOneByIdReq, ResponseWithBody<Music | null>>,
    CanPatchOneById<MusicPatchOneByIdReq, ResponseWithBody<MusicPatchOneByIdResBody>> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async patchOneById(
    req: MusicPatchOneByIdReq,
    res: ResponseWithBody<MusicPatchOneByIdResBody>,
    next: NextFunction,
  ): Promise<void> {
    const { id } = req.params;
    const { entity, unset } = req.body;
    const patchParams: PatchOneParams = {
      entity,
      unset,
    };

    await this.#deps.repo.patchOneById(id, patchParams);

    res.body = {};

    next();
  }

  async getOneById(
    req: MusicGetOneByIdReq,
    res: ResponseWithBody<Music | null>,
    next: NextFunction,
  ): Promise<void> {
    const { id } = req.params;

    res.body = await this.#deps.repo.getOneById(id);

    next();
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get(
      "/:id",
      validateReq(assertIsMusicGetOneByIdReq),
      this.getOneById.bind(this),
      validateResBody(assertIsMusic),
      sendBody,
    );

    router.options("/:id", (_, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(HttpStatusCode.OK);
    } );
    router.use(express.json());
    router.patch(
      "/:id",
      validateReq(assertIsMusicPatchOneByIdReq),
      this.patchOneById.bind(this),
      validateResBody(assertIsMusicPatchOneByIdResBody),
      sendBody,
    );

    return router;
  }
}
