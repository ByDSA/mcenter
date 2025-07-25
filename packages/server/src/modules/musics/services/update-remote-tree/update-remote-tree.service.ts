import { statSync } from "node:fs";
import { Injectable } from "@nestjs/common";
import z from "zod";
import { MusicFileInfo, MusicFileInfoEntity, musicFileInfoEntitySchema } from "$shared/models/musics/file-info";
import { musicEntitySchema } from "#musics/models";
import { MusicFileInfoRepository } from "#musics/file-info/repositories/repository";
import { MusicFileInfoOmitMusicIdBuilder } from "#musics/file-info/builder";
import { findAllValidMusicFiles as findAllPathsOfValidMusicFiles } from "../../files";
import { MusicRepository } from "../../repositories";
import { getFullPath } from "../../utils";
import { ChangesDetector, FileWithStats } from "./ChangesDetector";

export const updateResultSchema = z.object( {
  new: z.array(z.object( {
    music: musicEntitySchema,
    fileInfo: musicFileInfoEntitySchema,
  } )),
  deleted: z.array(musicFileInfoEntitySchema),
  moved: z.array(z.object( {
    original: musicFileInfoEntitySchema,
    newPath: z.string(),
  } )),
  updated: z.array(z.object( {
    old: musicFileInfoEntitySchema,
    new: musicFileInfoEntitySchema,
  } )),
} );

export type UpdateResult = z.infer<typeof updateResultSchema>;

@Injectable()
export class UpdateRemoteTreeService {
  constructor(
    private readonly musicFileInfoRepo: MusicFileInfoRepository,
    private readonly musicRepo: MusicRepository,
  ) {
  }

  async update() {
    const remoteMusic = await this.musicFileInfoRepo.getAll();
    const changes = await detectChangesFromLocalFiles(remoteMusic);
    const promises = [];
    const created: UpdateResult["new"] = [];
    const updated: UpdateResult["updated"] = [];

    for (const localFileMusic of changes.new) {
      const newMusic = await this.musicRepo.createOneFromPath(localFileMusic.path);
      const fileInfoOmitMusicId = await new MusicFileInfoOmitMusicIdBuilder()
        .withFileWithStats(localFileMusic)
        .build();
      const p = await this.musicFileInfoRepo.upsertOneByPathAndGet(localFileMusic.path, {
        ...fileInfoOmitMusicId,
        musicId: newMusic.id,
      } )
        .then((fileInfo) => {
          created.push( {
            music: newMusic,
            fileInfo,
          } );
        } )
        .catch((err) => {
          console.error(err.message, localFileMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const deletedMusic of changes.deleted) {
      const p = this.musicFileInfoRepo.deleteOneByPath(deletedMusic.path)
        .catch((err) => {
          console.error(err.message, deletedMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const { original, newPath } of changes.moved) {
      const newFileInfo: MusicFileInfo = {
        ...original,
        path: newPath,
      };
      const p = this.musicFileInfoRepo.upsertOneByPathAndGet(original.path, newFileInfo)
        .catch((err) => {
          console.error(err.message, original, newFileInfo);

          throw err;
        } );

      promises.push(p);
    }

    for (const oldMusicFileInfo of changes.updated) {
      const newMusicFileInfo = {
        musicId: oldMusicFileInfo.musicId,
        ...await new MusicFileInfoOmitMusicIdBuilder()
          .withPartial( {
            path: oldMusicFileInfo.path,
          } )
          .build(),
      };
      const p = this.musicFileInfoRepo.upsertOneByPathAndGet(
        oldMusicFileInfo.path,
        newMusicFileInfo,
      )
        .then(newMusic => {
          updated.push( {
            old: oldMusicFileInfo,
            new: newMusic,
          } );
        } )
        .catch((err: Error) => {
          console.error(err.message, oldMusicFileInfo);

          throw err;
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

async function detectChangesFromLocalFiles(remoteMusics: MusicFileInfoEntity[]) {
  const files = await findAllPathsOfValidMusicFiles();
  const filesWithMeta: FileWithStats[] = files.map((relativePath) => ( {
    path: relativePath,
    stats: statSync(getFullPath(relativePath)),
  } ));
  const changesDetector = new ChangesDetector(remoteMusics, filesWithMeta);

  return changesDetector.detectChanges();
}
