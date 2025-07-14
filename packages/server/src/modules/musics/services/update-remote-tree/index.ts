import { statSync } from "node:fs";
import { Injectable } from "@nestjs/common";
import z from "zod";
import { md5FileAsync } from "#utils/crypt";
import { MusicEntity, musicEntitySchema } from "#musics/models";
import { findAllValidMusicFiles as findAllPathsOfValidMusicFiles } from "../../files";
import { MusicRepository } from "../../repositories";
import { getFullPath } from "../../utils";
import { ChangesDetector, FileWithStats } from "./ChangesDetector";

export const updateResultSchema = z.object( {
  new: z.array(musicEntitySchema),
  deleted: z.array(musicEntitySchema),
  moved: z.array(z.object( {
    original: musicEntitySchema,
    newPath: z.string(),
  } )),
  updated: z.array(z.object( {
    old: musicEntitySchema,
    new: musicEntitySchema,
  } )),
} );

export type UpdateResult = z.infer<typeof updateResultSchema>;

@Injectable()
export class UpdateRemoteTreeService {
  constructor(
    private readonly musicRepository: MusicRepository,
  ) {
  }

  async update() {
    const remoteMusic = await this.musicRepository.findAll();
    const changes = await detectChangesFromLocalFiles(remoteMusic);
    const promises = [];
    const created: UpdateResult["new"] = [];
    const updated: UpdateResult["updated"] = [];

    for (const localFileMusic of changes.new) {
      const p = this.musicRepository.createOneFromPath(localFileMusic.path)
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
      const p = this.musicRepository.deleteOneByPath(deletedMusic.path)
        .catch((err) => {
          console.error(err.message, deletedMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const { original, newPath } of changes.moved) {
      const newMusic = {
        ...original,
        path: newPath,
      };
      const p = this.musicRepository.updateOneByPath(original.path, newMusic)
        .catch((err) => {
          console.error(err.message, original, newMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const oldMusic of changes.updated) {
      const newMusic = await toUpdatedFileInfo(oldMusic);
      const p = this.musicRepository.updateOneByPath(oldMusic.path, newMusic)
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
async function detectChangesFromLocalFiles(remoteMusics: MusicEntity[]) {
  const files = await findAllPathsOfValidMusicFiles();
  const filesWithMeta: FileWithStats[] = files.map((relativePath) => ( {
    path: relativePath,
    stats: statSync(getFullPath(relativePath)),
  } ));
  const changesDetector = new ChangesDetector(remoteMusics, filesWithMeta);

  return changesDetector.detectChanges();
}

async function toUpdatedFileInfo(music: MusicEntity) {
  const fullPath = getFullPath(music.path);
  const { size } = statSync(fullPath);
  const newMusic: MusicEntity = {
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
