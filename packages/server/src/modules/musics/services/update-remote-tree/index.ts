import { MusicVO } from "#shared/models/musics";
import { md5FileAsync } from "#utils/crypt";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { statSync } from "node:fs";
import { findAllValidMusicFiles as findAllPathsOfValidMusicFiles } from "../../files";
import { Repository as MusicRepository } from "../../repositories";
import { getFullPath } from "../../utils";
import ChangesDetector, { FileWithStats } from "./ChangesDetector";

export type UpdateResult = {
  new: MusicVO[];
  deleted: MusicVO[];
  moved: {original: MusicVO; newPath: string}[];
  updated: {old: MusicVO; new: MusicVO}[];
};

const DepsMap = {
  musicRepository: MusicRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export class UpdateRemoteTreeService {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async update() {
    const remoteMusic = await this.#deps.musicRepository.findAll();
    const changes = await detectChangesFromLocalFiles(remoteMusic);
    const promises = [];
    const created: UpdateResult["new"] = [];
    const updated: UpdateResult["updated"] = [];

    for (const localFileMusic of changes.new) {
      const p = this.#deps.musicRepository.createFromPath(localFileMusic.path)
        .then((music) => {
          created.push(music);
        } )
        .catch((err) => {
          console.error(err.message, localFileMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const deletedMusic of changes.deleted) {
      const p = this.#deps.musicRepository.deleteOneByPath(deletedMusic.path)
        .catch((err) => {
          console.error(err.message, deletedMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const {original, newPath} of changes.moved) {
      const newMusic = {
        ...original,
        path: newPath,
      };
      const p = this.#deps.musicRepository.updateOneByPath(original.path, newMusic)
        .catch((err) => {
          console.error(err.message, original, newMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const oldMusic of changes.updated) {
      const newMusic = await toUpdatedFileInfo(oldMusic);
      const p = this.#deps.musicRepository.updateOneByPath(oldMusic.path, newMusic)
        .catch((err: Error) => {
          console.error(err.message, newMusic);

          throw err;
        } );

      updated.push( {
        old: oldMusic,
        new: newMusic,
      } );

      promises.push(p);
    }

    await Promise.all(promises);

    const ret: UpdateResult = {
      new: created,
      deleted: changes.deleted,
      moved: changes.moved,
      updated,
    };

    return ret;
  }
}
async function detectChangesFromLocalFiles(remoteMusics: MusicVO[]) {
  const files = await findAllPathsOfValidMusicFiles();
  const filesWithMeta: FileWithStats[] = files.map((relativePath) => ( {
    path: relativePath,
    stats: statSync(getFullPath(relativePath)),
  } ));
  const changesDetector = new ChangesDetector(remoteMusics, filesWithMeta);

  return changesDetector.detectChanges();
}

async function toUpdatedFileInfo(music: MusicVO) {
  const fullPath = getFullPath(music.path);
  const {size} = statSync(fullPath);
  const newMusic: MusicVO = {
    ...music,
    size,
    timestamps: music.timestamps,
    hash: await md5FileAsync(fullPath),
    mediaInfo: {
      duration: null,
    },
  };

  return newMusic;
}