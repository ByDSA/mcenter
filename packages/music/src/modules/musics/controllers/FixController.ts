import { Music } from "#shared/models/musics";
import { Request, Response, Router } from "express";
import { existsSync } from "node:fs";
import { MusicRepository } from "..";
import { assertEnv, getFullPath } from "../../../env";
import { calcHashFromFile, findAllValidMusicFiles, findFiles } from "../../../files";

const API = "/api";
const CREATE = `${API}/create`;
const ROUTE_CREATE_YT = `${CREATE}/yt`;

type Params = {
  musicRepository: MusicRepository;
};
export default class FixController {
  #musicRepository: MusicRepository;

  constructor( { musicRepository }: Params) {
    this.#musicRepository = musicRepository;
  }

  async fixAll(_: Request, res: Response) {
    const remoteMusic = await this.#musicRepository.findAll();
    const localMusic = await this.#fixDataFromLocalFiles();
    const ret = {
      new: [] as Music[],
      deleted: [] as Music[],
    };

    // eslint-disable-next-line no-restricted-syntax, no-labels
    for (const m of remoteMusic) {
      if (!localMusic.some((ml) => ml.path === m.path)) {
        // this.#musicRepository.deleteOneByPath(m.path);
        ret.deleted.push(m);
      }
    }

    // TODO: faltan los nuevos en el ret

    res.send(ret);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fixOne(req: Request, res: Response) {
    const local = <string | undefined>req.query.local;
    const {url} = req.query;

    if (typeof url !== "string" && typeof local !== "string") {
      res.sendStatus(404);

      return;
    }

    let path = local;
    let music: Music | null = null;

    if (!path && typeof url === "string") {
      music = await this.#musicRepository.findByUrl(url);

      if (music)
        path = music.path;
    }

    let existsPath = false;

    if (path)
      existsPath = existsSync(getFullPath(path));

    if (!path || (!music && !existsPath)) {
      res.sendStatus(404);

      return;
    }

    await this.#fixDataFromLocalFile(path);

    if (music && typeof url === "string") {
      const { hash } = music;

      assertEnv();
      const folder = <string>process.env.MEDIA_PATH;
      const files = findFiles( {
        fileHash: hash,
        folder,
        onlyFirst: true,
      } );

      if (files.length > 0) {
      // eslint-disable-next-line prefer-destructuring
        music.path = files[0];
        this.#musicRepository.updateOneByUrl(url, music);
      } else
        this.#musicRepository.deleteOneByPath(music.path);
    }

    res.sendStatus(200);
  }

  async #fixDataFromLocalFiles(): Promise<Music[]> {
    const files = findAllValidMusicFiles();
    const musics = files.map((relativePath) => this.#fixDataFromLocalFile(relativePath));

    return Promise.all(musics);
  }

  async #fixDataFromLocalFile(relativePath: string) {
    const fullPath = getFullPath(relativePath);
    const hash = calcHashFromFile(fullPath);
    const musicByHash = await this.#musicRepository.findByHash(hash);
    let music;

    if (musicByHash) {
      music = musicByHash;

      if (music.path !== relativePath) {
        music.path = relativePath;
        this.#musicRepository.updateOneByHash(hash, music);
      }
    } else {
      const musicByPath = await this.#musicRepository.findByPath(relativePath);

      if (musicByPath) {
        musicByPath.hash = hash;
        music = musicByPath;
        this.#musicRepository.updateOneByPath(relativePath, music);
      } else
        music = await this.#musicRepository.createFromPath(relativePath);
    }

    return music;
  }

  getRouter(): Router {
    const router = Router(); // TODO: cambiar por SecureRouter

    router.get("/all", this.fixAll.bind(this));
    router.get("/one", this.fixOne.bind(this));

    router.get(`${ROUTE_CREATE_YT}/:id`, async (req, res) => {
      const { id } = req.params;
      const data = await this.#musicRepository.findOrCreateFromYoutube(id);

      res.send(data);
    } );

    return router;
  }
}
