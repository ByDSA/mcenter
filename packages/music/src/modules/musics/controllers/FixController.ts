import { Music } from "#shared/models/musics";
import { Request, Response, Router } from "express";
import { statSync } from "node:fs";
import { MusicRepository } from "..";
import { getFullPath } from "../../../env";
import { calcHashFromFile, findAllValidMusicFiles as findAllPathsOfValidMusicFiles } from "../../../files";
import UrlGenerator, { fixUrl } from "../repositories/UrlGenerator";
import ChangesDetector, { FileWithStats } from "./ChangesDetector";

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

    const ret = {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fixIntegrity(_: Request, res: Response) {
    const musics = await this.#musicRepository.findAll();
    const ret = {
      updatedSize: [] as Music[],
      repeatedPaths: [] as Music[],
      repeatedUrls: [] as Music[],
      repeatedHashes: [] as Music[],
      fixedUrls: [] as {original: Music; newUrl: string}[],
      fixedHashes: [] as {original: Music; newHash: string}[],
    };
    const promises = [];

    for (const music of musics) {
      // Hashes SHA256 en vez de MD5
      if (music.hash === null || music.hash.length !== 32) {
        // eslint-disable-next-line no-await-in-loop
        const hash = await calcHashFromFile(getFullPath(music.path));

        // eslint-disable-next-line no-await-in-loop
        await this.#musicRepository.updateOneByPath(music.path, {
          ...music,
          hash,
        } ).then(() => {
          ret.fixedHashes.push( {
            original: music,
            newHash: hash,
          } );
        } );
      }

      // Músicas sin size
      if (!music.size && music.size !== 0) {
        const stats = statSync(getFullPath(music.path));

        // eslint-disable-next-line no-param-reassign
        music.size = stats.size;

        const p = this.#musicRepository.updateOneByPath(music.path, music);

        p.then(() => {
          ret.updatedSize.push(music);
        } );
        promises.push(p);
      }

      // Paths repetidos
      {
        const mFound = musics.find((m) => m.path === music.path) as Music | undefined;

        if (!mFound)
          throw new Error("mFound is undefined");

        if (mFound !== music)
          ret.repeatedPaths.push(music, mFound);
      }

      // Urls repetidas
      {
        const mFound = musics.find((m) => m.url === music.url) as Music | undefined;

        if (!mFound)
          throw new Error("mFound is undefined");

        if (mFound !== music)
          ret.repeatedUrls.push(music, mFound);
      }

      // Hash repetido
      {
        const mFound = musics.find((m) => m.hash === music.hash) as Music | undefined;

        if (!mFound)
          throw new Error("mFound is undefined");

        if (mFound !== music)
          ret.repeatedHashes.push(music, mFound);
      }

      // Urls fixes
      {
        const {url} = music;
        const fixedUrl = fixUrl(url);

        if (fixedUrl !== url) {
          const urlGenerator = new UrlGenerator( {
            musicRepository: this.#musicRepository,
          } );
          const p = urlGenerator.getAvailableUrlFromUrl(fixedUrl)
            .then((availableUrl) => {
              ret.fixedUrls.push( {
                original: music,
                newUrl: availableUrl,
              } );

              return this.#musicRepository.updateOneByPath(music.path, {
                ...music,
                url: availableUrl,
              } );
            } );

          promises.push(p);
        }
      }
    }

    await Promise.all(promises);

    res.send(ret);
  }

  getRouter(): Router {
    const router = Router(); // TODO: cambiar por SecureRouter

    router.get("/all", this.fixAll.bind(this));

    router.get("/integrity", this.fixIntegrity.bind(this));

    router.get(`${ROUTE_CREATE_YT}/:id`, async (req, res) => {
      const { id } = req.params;
      const data = await this.#musicRepository.findOrCreateFromYoutube(id);

      res.send(data);
    } );

    return router;
  }
}