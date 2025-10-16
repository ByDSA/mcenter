import type { Progress } from "./task.handler";
import { Injectable, Logger } from "@nestjs/common";
import z from "zod";
import { MusicFileInfo, MusicFileInfoEntity, musicFileInfoEntitySchema, MusicFileInfoOmitMusicId } from "$shared/models/musics/file-info";
import { Job } from "bullmq";
import { musicEntitySchema } from "#musics/models";
import { MusicFileInfoRepository } from "#musics/file-info/crud/repository";
import { MusicFileInfoOmitMusicIdBuilder } from "#musics/file-info/builder";
import { showError } from "#core/logging/show-error";
import { findAllValidMusicFiles as findAllPathsOfValidMusicFiles } from "../../files";
import { MusicsRepository } from "../../crud/repositories/music";
import { ChangesDetector } from "./changes-detector";

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

type Props = {
  job: Job;
  userId: string;
};

@Injectable()
export class UpdateRemoteTreeService {
  static readonly logger = new Logger(UpdateRemoteTreeService.name);

  constructor(
    private readonly fileInfoRepo: MusicFileInfoRepository,
    private readonly musicRepo: MusicsRepository,
  ) {
  }

  async update(props: Props) {
    const { job } = props;

    await job.updateProgress( {
      percentage: 0,
      message: "Starting",
    } );
    const remoteMusic = await this.fileInfoRepo.getAll();

    await job.updateProgress( {
      percentage: 3,
      message: "Fetched database musics.",
    } );
    const changes = await detectChangesFromLocalFiles(remoteMusic, props);

    await job.updateProgress( {
      percentage: 96,
      message: "Updating database ...",
    } );

    const promises = [];
    const created: UpdateResult["new"] = [];
    const updated: UpdateResult["updated"] = [];

    for (const localFileMusic of changes.new) {
      const p = this.musicRepo.createOneFromPath(localFileMusic.path, props.userId, localFileMusic)
        .then((got) => {
          created.push(got);
        } )
        .catch((err) => {
          UpdateRemoteTreeService.logger.error(err.message, localFileMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const deletedMusic of changes.deleted) {
      const p = this.fileInfoRepo.deleteOneByPath(deletedMusic.path)
        .catch((err) => {
          UpdateRemoteTreeService.logger.error(err.message, deletedMusic);

          throw err;
        } );

      promises.push(p);
    }

    for (const { original, newPath } of changes.moved) {
      const newFileInfo: MusicFileInfo = {
        ...original,
        path: newPath,
      };
      const p = this.fileInfoRepo.upsertOneByPathAndGet(original.path, newFileInfo)
        .catch((err) => {
          UpdateRemoteTreeService.logger.error(err.message, original, newFileInfo);

          throw err;
        } );

      promises.push(p);
    }

    for (const u of changes.updated) {
      const newMusicFileInfo = u.new;
      const p = this.fileInfoRepo.upsertOneByPathAndGet(
        u.old.path,
        newMusicFileInfo,
      )
        .then(newMusicFile => {
          updated.push( {
            new: newMusicFile,
            old: u.old,
          } );
        } )
        .catch((err: Error) => {
          UpdateRemoteTreeService.logger.error(err.message, u.old);

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

    await job.updateProgress( {
      percentage: 100,
      message: "Done!",
    } satisfies Progress);

    return ret;
  }
}

async function detectChangesFromLocalFiles(remoteMusics: MusicFileInfoEntity[], options: Props) {
  const relativeFilePaths = await findAllPathsOfValidMusicFiles();
  const filesWithMeta: MusicFileInfoOmitMusicId[] = [];

  // Hacerlo secuencial y ordenar por path para aprovechar localidad espacial del HDD
  relativeFilePaths.sort();

  let i = 0;

  for (const relativePath of relativeFilePaths) {
    options.job.updateProgress( {
      percentage: 5 + ((95 - 5) * (i / relativeFilePaths.length)),
      message: `${++i} / ${relativeFilePaths.length}: ${relativePath}`,
    } )
      .catch(showError);
    const file = await new MusicFileInfoOmitMusicIdBuilder().withPartial( {
      path: relativePath,
    } )
      .build();

    filesWithMeta.push(file);
  }

  const changesDetector = new ChangesDetector(remoteMusics, filesWithMeta);

  return changesDetector.detectChanges();
}
