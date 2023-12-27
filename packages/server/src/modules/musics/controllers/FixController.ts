/* eslint-disable no-use-before-define */
import { Music } from "#shared/models/musics";
import { PublicMethodsOf } from "#shared/utils/types";
import { SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";
import { statSync } from "node:fs";
import { MusicRepository } from "..";
import { findAllValidMusicFiles as findAllPathsOfValidMusicFiles } from "../files";
import { getFullPath } from "../utils";
import ChangesDetector, { FileWithStats } from "./ChangesDetector";

const API = "/api";
const CREATE = `${API}/create`;
const ROUTE_CREATE_YT = `${CREATE}/yt`;

export type ChangesResponse = {
  new: Music[];
  deleted: Music[];
  moved: {original: Music; newPath: string}[];
  updated: Music[];
};

type Params = {
  musicRepository: MusicRepository;
};
export default class FixController {
  #musicRepository: PublicMethodsOf<MusicRepository>;

  constructor( { musicRepository }: Params) {
    this.#musicRepository = musicRepository;
  }

  async fixAll(_: Request, res: Response) {
    const remoteMusic = await this.#musicRepository.findAll();
    const changes = await this.#detectChangesFromLocalFiles(remoteMusic);
    const promises = [];
    const created: Music[] = [];

    for (const localFileMusic of changes.new) {
      const p = this.#musicRepository.createFromPath(localFileMusic.path)
        .then((music) => {
          created.push(music);
        } );

      promises.push(p);
    }

    for (const deletedMusic of changes.deleted) {
      const p = this.#musicRepository.deleteOneByPath(deletedMusic.path);

      promises.push(p);
    }

    for (const {original, newPath} of changes.moved) {
      const newMusic = {
        ...original,
        path: newPath,
      };
      const p = this.#musicRepository.updateOneByPath(original.path, newMusic);

      promises.push(p);
    }

    for (const updatedMusic of changes.updated) {
      const p = this.#musicRepository.updateOneByPath(updatedMusic.path, updatedMusic);

      promises.push(p);
    }

    await Promise.all(promises);

    const ret: ChangesResponse = {
      new: created,
      deleted: changes.deleted,
      moved: changes.moved,
      updated: changes.updated,
    };

    res.send(ret);
  }

  async #detectChangesFromLocalFiles(remoteMusics: Music[]) {
    const files = await findAllPathsOfValidMusicFiles();
    const filesWithMeta: FileWithStats[] = files.map((relativePath) => ( {
      path: relativePath,
      stats: statSync(getFullPath(relativePath)),
    } ));
    const changesDetector = new ChangesDetector(remoteMusics, filesWithMeta);

    return changesDetector.detectChanges();
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/all", this.fixAll.bind(this));

    router.get(`${ROUTE_CREATE_YT}/:id`, async (req, res) => {
      const { id } = req.params;
      const data = await this.#musicRepository.findOrCreateFromYoutube(id);

      res.send(data);
    } );

    return router;
  }
}
