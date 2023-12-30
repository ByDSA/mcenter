import { md5FileAsync } from "#modules/episodes/file-info/update/UpdateSavedProcess";
import { MusicRepository } from "#modules/musics";
import { MusicVO } from "#shared/models/musics";
import { statSync } from "node:fs";
import { findAllValidMusicFiles as findAllPathsOfValidMusicFiles } from "../../files";
import { getFullPath } from "../../utils";
import ChangesDetector, { FileWithStats } from "./ChangesDetector";

export type UpdateResult = {
  new: MusicVO[];
  deleted: MusicVO[];
  moved: {original: MusicVO; newPath: string}[];
  updated: {old: MusicVO; new: MusicVO}[];
};

type Params = {
  musicRepository: MusicRepository;
};
export class UpdateRemoteTreeService {
  #musicRepository: MusicRepository;

  constructor( {musicRepository}: Params) {
    this.#musicRepository = musicRepository;
  }

  async update() {
    const remoteMusic = await this.#musicRepository.findAll();
    const changes = await detectChangesFromLocalFiles(remoteMusic);
    const promises = [];
    const created: UpdateResult["new"] = [];
    const updated: UpdateResult["updated"] = [];

    for (const localFileMusic of changes.new) {
      const p = this.#musicRepository.createFromPath(localFileMusic.path)
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
      const p = this.#musicRepository.deleteOneByPath(deletedMusic.path)
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
      const p = this.#musicRepository.updateOneByPath(original.path, newMusic)
        .catch((err) => {
          console.error(err.message, original, newMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const oldMusic of changes.updated) {
      // eslint-disable-next-line no-await-in-loop
      const newMusic = await toUpdatedFileInfo(oldMusic);
      const p = this.#musicRepository.updateOneByPath(oldMusic.path, newMusic)
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
  const {size, ctime, mtime} = statSync(fullPath);
  const newMusic: MusicVO = {
    ...music,
    size,
    timestamps: {
      createdAt: ctime,
      updatedAt: mtime,
    },
    hash: await md5FileAsync(fullPath),
    mediaInfo: {
      duration: null,
    },
  };

  return newMusic;
}