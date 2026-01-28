import { existsSync } from "fs";
import fs from "node:fs";
import path from "node:path";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { safeOneConcurrent, safeSequential } from "$shared/utils/errors";
import { createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { EpisodeTasks } from "$shared/models/episodes/admin";
import { assertIsDefined } from "$shared/utils/validation";
import ffmpeg from "fluent-ffmpeg";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { EpisodesRepository } from "../../crud/repositories/episodes";
import { diffSerieTree as diffSeriesTree, EpisodeFile, findAllSerieFolderTreesAt, OldNewSerieTree as OldNew } from "./disk";
import { RemoteSeriesTreeService } from "./db";
import { SerieNode, SerieTree, EpisodeNode } from "./disk/models";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { SeriesRepository } from "#modules/series/crud/repository";
import { EpisodeFileInfo, EpisodeFileInfoEntity, EpisodeFileInfoOmitEpisodeId, episodeFileInfoSchema } from "#episodes/file-info/models";
import { Serie } from "#modules/series";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { md5FileAsync } from "#utils/crypt";
import { Episode } from "#episodes/models";

const TASK_NAME = EpisodeTasks.sync.name;

export const payloadSchema = z.object( {
  uploaderUserId: mongoDbId,
} );
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = TasksCrudDtos.TaskStatus.progressSchemaBase;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.object( {
  new: z.array(episodeFileInfoSchema),
  updated: z.array(episodeFileInfoSchema),
} ));

type Payload = z.infer<typeof payloadSchema>;
type Progress = z.infer<typeof progressSchema>;
type Result = z.infer<typeof resultSchema>;

type ModelOmitEpisodeId = EpisodeFileInfoOmitEpisodeId;

@Injectable()
@TaskHandlerClass()
export class EpisodeUpdateRemoteTaskHandler implements TaskHandler<Payload, Result> {
  private readonly logger = new Logger(EpisodeUpdateRemoteTaskHandler.name);

  constructor(
    private readonly seriesRepo: SeriesRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly savedSerieTreeService: RemoteSeriesTreeService,
    private readonly fileInfoRepo: EpisodeFileInfoRepository,
    private readonly taskService: TaskService,
  ) {
  }

  readonly taskName = TASK_NAME;

  async addTask(
    payload: Payload,
    options?: Partial<TasksCrudDtos.CreateTask.TaskOptions>,
  ) {
    await this.taskService.assertJobIsNotRunningOrPendingByName(TASK_NAME);

    const job = await this.taskService.addTask<Payload>(
      TASK_NAME,
      payloadSchema.parse(payload),
      {
        ...options,
      },
    );

    return job;
  }

  async execute(payload: Payload, job: Job): Promise<Result> {
    const updateProgress = async (p: Progress) => {
      return await job.updateProgress(p);
    };

    await updateProgress( {
      message: "Starting",
      percentage: 0,
    } );
    let localSeriesTree: SerieTree;
    let remoteSeriesTree: SerieTree;
    let diff: ReturnType<typeof diffSeriesTree>;
    let data = {
      new: [] as EpisodeFileInfo[],
      updated: [] as EpisodeFileInfo[],
    };
    const { errors } = await safeSequential(
      [
      // 1
        async ()=> {
          await updateProgress( {
            message: "Getting local series tree ...",
            percentage: 5,
          } );
          localSeriesTree = await this.getLocalSeriesTree();
        },
        // 2
        async () => {
          await updateProgress( {
            message: "Getting database series tree ...",
            percentage: 50,
          } );
          remoteSeriesTree = await this.savedSerieTreeService.getRemoteSeriesTree();
        },
        // 3
        async () => {
          await updateProgress( {
            message: "Calc differences between local and database trees ...",
            percentage: 75,
          } );
          diff = diffSeriesTree(
            remoteSeriesTree,
            localSeriesTree,
          );

          diff.moved = diff.moved.filter(
            move => move.old.content.filePath !== move.new.content.filePath,
          );

          await updateProgress( {
            message: "Saving new file infos and episodes ...",
            percentage: 85,
          } );

          const savedData = await this.saveNewFileInfosAndEpisode(
            diff.new.children,
            payload.uploaderUserId,
          );

          data.new = savedData;
        },
        // 4
        async ()=> {
          await updateProgress( {
            message: "Saving changes to database ...",
            percentage: 90,
          } );
          const updatedEpisodesResult = await this.#safeUpdateEpisodes(
            [...diff.updated, ...diff.moved],
          );

          data.updated = updatedEpisodesResult.data;

          return updatedEpisodesResult;
        },
      ],
      {
        stopOnError: true,
      },
    );

    await updateProgress( {
      message: "Done!",
      percentage: 100,
    } );

    return {
      data,
      errors,
    };
  }

  async #safeUpdateEpisodes(oldNew: OldNew[]): Promise<ResultResponse<EpisodeFileInfoEntity[]>> {
    const got = await safeOneConcurrent(oldNew.map(entry=>()=> {
      return this.fileInfoRepo
        .patchOneByPathAndGet(entry.old.content.filePath, {
          entity: {
            path: entry.new.content.filePath,
          },
        } );
    } ));

    return {
      ...got,
      data: got.data.filter(Boolean) as EpisodeFileInfoEntity[],
    };
  }

  private async saveNewFileInfosAndEpisode(
    seriesNodes: SerieNode[],
    userId: string,
  ): Promise<EpisodeFileInfoEntity[]> {
    const allFileInfos: EpisodeFileInfoEntity[] = [];

    // Recopilar todas las promesas para procesarlas en paralelo
    for (const seriesNode of seriesNodes) {
    // Crear la promesa de la serie una vez
      const seriePromise = this.seriesRepo.getOneOrCreate( {
        name: seriesNode.key,
        key: seriesNode.key,
      } );

      // Para cada temporada y episodio, crear las promesas que dependen de la serie
      for (const seasonInTree of seriesNode.children) {
        for (const episodeInTree of seasonInTree.children) {
          // se hace await para no leer varios capítulos en disco en paralelo
          const episodeFileInfo = await seriePromise.then(
            serie => this.createFileInfoFromLocalEpisode(episodeInTree, serie, userId),
          );

          allFileInfos.push(episodeFileInfo);
        }
      }
    }

    // Un solo await para todas las promesas
    return allFileInfos;
  }

  private async createFileInfoFromLocalEpisode(
    localEpisode: EpisodeNode,
    serie: Serie,
    userId: string,
  ) {
    const episode: Omit<Episode, "addedAt" | "createdAt" | "releasedOn" | "updatedAt"> = {
      compKey: {
        episodeKey: localEpisode.content.episodeKey,
        seriesKey: serie.key,
      },
      title: `${serie.name} ${localEpisode.content.episodeKey}`,
      uploaderUserId: userId,
    };
    const gotEpisode = await this.episodesRepo.getOneOrCreate(episode);
    const fileInfo: EpisodeFileInfo = {
      ...await this.episodeFileToFileInfoOmitEpisodeId(localEpisode),
      episodeId: gotEpisode.id,
    };
    const gotFileInfo = await this.fileInfoRepo.createOneAndGet(fileInfo);

    return gotFileInfo;
  }

  async episodeFileToFileInfoOmitEpisodeId(
    episodeFile: EpisodeFile,
  ): Promise<ModelOmitEpisodeId> {
    const { filePath } = episodeFile.content;
    const MEDIA_FOLDER = process.env.MEDIA_FOLDER_PATH;

    assertIsDefined(MEDIA_FOLDER);

    const fullFilePath = `${MEDIA_FOLDER}/${filePath}`;

    if (!existsSync(fullFilePath))
      throw new Error("UpdateMetadataProcess: file '" + fullFilePath + "' not exists");

    const episodeFileInfo: ModelOmitEpisodeId = await new Promise((resolve, reject) =>{
      ffmpeg.ffprobe(fullFilePath, async (err, metadata) => {
        if (err) {
          if (err instanceof Error && err.message === "Cannot find ffprobe") {
            const newError = new InternalServerErrorException();

            newError.message = err.message;
            newError.stack = err.stack;

            return reject(newError);
          }

          return reject(err);
        }

        if (!metadata)
          return;

        const duration = metadata.format?.duration ?? null;
        const resolution = {
          width: metadata.streams[0].width ?? null,
          height: metadata.streams[0].height ?? null,
        };
        const fps = metadata.streams[0].r_frame_rate ?? null;
        const { mtime, ctime, size } = fs.statSync(fullFilePath);
        const createdAt = new Date(ctime);
        const updatedAt = new Date(mtime);

        this.logger.log(`got metadata of ${filePath}`);

        const ret: ModelOmitEpisodeId = {
          path: filePath,
          hash: await md5FileAsync(fullFilePath),
          size,
          timestamps: {
            createdAt,
            updatedAt,
          },
          mediaInfo: {
            duration,
            resolution,
            fps,
          },
        };

        return resolve(ret);
      } );
    } );

    return episodeFileInfo;
  }

  // eslint-disable-next-line require-await
  async getLocalSeriesTree() {
    const { MEDIA_FOLDER_PATH } = process.env;

    assertIsDefined(MEDIA_FOLDER_PATH);

    const seriesPath = path.join(MEDIA_FOLDER_PATH, "series");
    const filesSerieTreeResult = findAllSerieFolderTreesAt(seriesPath, {
      baseFolder: "series/",
    } );

    return filesSerieTreeResult;
  }
}
