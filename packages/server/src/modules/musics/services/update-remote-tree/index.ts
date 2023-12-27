import { MusicRepository } from "#modules/musics";
import { Music } from "#shared/models/musics";
import { statSync } from "node:fs";
import { findAllValidMusicFiles as findAllPathsOfValidMusicFiles } from "../../files";
import { getFullPath } from "../../utils";
import ChangesDetector, { FileWithStats } from "./ChangesDetector";

export type UpdateResult = {
  new: Music[];
  deleted: Music[];
  moved: {original: Music; newPath: string}[];
  updated: Music[];
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

    const ret: UpdateResult = {
      new: created,
      deleted: changes.deleted,
      moved: changes.moved,
      updated: changes.updated,
    };

    return ret;
  }
}
async function detectChangesFromLocalFiles(remoteMusics: Music[]) {
  const files = await findAllPathsOfValidMusicFiles();
  const filesWithMeta: FileWithStats[] = files.map((relativePath) => ( {
    path: relativePath,
    stats: statSync(getFullPath(relativePath)),
  } ));
  const changesDetector = new ChangesDetector(remoteMusics, filesWithMeta);

  return changesDetector.detectChanges();
}