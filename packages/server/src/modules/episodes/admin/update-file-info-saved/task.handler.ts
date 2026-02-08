import { existsSync } from "fs";
import fs from "node:fs";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { createOneResultResponseSchema, ErrorElementResponse, errorToErrorElementResponse } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { EpisodeTasks } from "$shared/models/episodes/admin";
import { assertIsDefined } from "$shared/utils/validation";
import ffmpeg from "fluent-ffmpeg";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { md5FileAsync } from "#utils/crypt";
import { EpisodeFileInfoEntity, EpisodeFileInfoOmitEpisodeId, compareEpisodeFileInfoOmitEpisodeId, episodeFileInfoEntitySchema } from "#episodes/file-info/models";
import { assertFoundServer } from "#utils/validation/found";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { SeriesNode } from "../sync-disk-to-db/disk/models";
import { EpisodeFile, SerieFolderTree } from "../sync-disk-to-db/disk";
import { RemoteSeriesTreeService } from "../sync-disk-to-db/db";

type Entity = EpisodeFileInfoEntity;
type ModelOmitEpisodeId = EpisodeFileInfoOmitEpisodeId;
const compareModelOmitEpisodeId:
 typeof compareEpisodeFileInfoOmitEpisodeId = compareEpisodeFileInfoOmitEpisodeId;

type Options = {
  forceHash?: boolean;
};

const TASK_NAME = EpisodeTasks.updateFileInfoSaved.name;

export const payloadSchema = z.object( {
  forceHash: z.boolean().optional(),
} );
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = TasksCrudDtos.TaskStatus.progressSchemaBase;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.array(episodeFileInfoEntitySchema));

type Payload = z.infer<typeof payloadSchema>;
type Progress = z.infer<typeof progressSchema>;
type Result = z.infer<typeof resultSchema>;

@Injectable()
@TaskHandlerClass()
export class EpisodeUpdateFileInfoSavedTaskHandler implements TaskHandler<Payload, Result> {
  constructor(
    private readonly taskService: TaskService,
    private readonly savedSerieTreeService: RemoteSeriesTreeService,
    private readonly fileInfosRepo: EpisodeFileInfoRepository,
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

    const seriesTree: SerieFolderTree = await this.savedSerieTreeService.getRemoteSeriesTree();

    await updateProgress( {
      message: "Got paths",
      percentage: 5,
    } );
    const fileInfos: Entity[] = [];
    const errors: ErrorElementResponse[] = [];
    const n = seriesTree.children
      .flatMap(series => series.children)
      .flatMap(season => season.children)
      .length;
    let i = 0;

    for (const series of seriesTree.children) {
      for (const season of series.children) {
        for (const episode of season.children) {
          i++;
          await updateProgress( {
            message: "Updating: " + series.key + " " + season.key + "x" + episode.key,
            percentage: 5 + ((99 - 5) * (i / n)),
          } );
          await this.genEpisodeFileInfoAndUpdateOrCreate(series.key, episode, {
            forceHash: payload?.forceHash ?? false,
          } )
            .then((episodeFileWithId) => {
              if (episodeFileWithId)
                fileInfos.push(episodeFileWithId);
            } )
            .catch((err) => {
              if (err instanceof InternalServerErrorException)
                throw err;
              else if (err instanceof Error) {
                const error = errorToErrorElementResponse(err);

                errors.push(error);
              }
            } );
        }
      }
    }

    await updateProgress( {
      message: "Done!",
      percentage: 100,
    } );

    return {
      errors,
      data: fileInfos,
    };
  }

  private async genEpisodeFileInfoFromEpisodeOrFail(
    seriesKey: SeriesNode["key"],
    episode: EpisodeFile,
    options: Options,
  ): Promise<Entity | null> {
    const { filePath, episodeKey } = episode.content;
    const MEDIA_FOLDER = process.env.MEDIA_FOLDER_PATH;

    assertIsDefined(MEDIA_FOLDER);

    const currentEpisodeFile = await this.fileInfosRepo.getOneByPath(filePath);
    const fullFilePath = `${MEDIA_FOLDER}/${filePath}`;

    if (!existsSync(fullFilePath))
      throw new Error("file '" + fullFilePath + "' not exists");

    const episodeFileInfo = await new Promise((resolve, reject) =>{
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
        const ret: ModelOmitEpisodeId = {
          path: filePath,
          hash: currentEpisodeFile?.hash ?? "null",
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
        const mustUpdate = options.forceHash
           || !currentEpisodeFile
           || !compareModelOmitEpisodeId(ret, currentEpisodeFile);

        if (!mustUpdate)
          return resolve(null);

        ret.hash = await md5FileAsync(fullFilePath);

        return resolve(ret);
      } );
    } );

    if (episodeFileInfo === null)
      return null;

    const seriesDoc = await SeriesOdm.Model.findOne( {
      key: seriesKey,
    } );

    assertFoundServer(seriesDoc);
    const seriesId = seriesDoc._id.toString();
    const episodeDoc = await EpisodeOdm.Model.findOne( {
      episodeKey,
      seriesId,
    } );

    assertFoundServer(episodeDoc);
    const episodeId = episodeDoc._id;

    assertIsDefined(
      episodeId,
      `episode with key ${episodeKey} in ${seriesKey} not found`,
    );

    const episodeFileWithId = {
      ...episodeFileInfo,
      episodeId: episodeId.toString(),
    } as Entity;

    return episodeFileWithId;
  }

  async genEpisodeFileInfoAndUpdateOrCreate(
    seriesKey: string,
    episode: EpisodeFile,
    options: Options,
  ): Promise<Entity | null> {
    const episodeFileWithId = await this.genEpisodeFileInfoFromEpisodeOrFail(
      seriesKey,
      episode,
      options,
    );

    if (episodeFileWithId === null)
      return null;

    await this.fileInfosRepo
      .updateOneByEpisodeId(episodeFileWithId.episodeId, episodeFileWithId);

    return episodeFileWithId;
  }
}
