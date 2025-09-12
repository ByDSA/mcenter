import { Injectable } from "@nestjs/common";
import { safeOneConcurrent, safeSequential } from "$shared/utils/errors";
import { createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { EpisodeTasks } from "$shared/models/episodes/admin";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { SeriesRepository } from "#modules/series/crud/repository";
import { EpisodeFileInfo, EpisodeFileInfoEntity, episodeFileInfoSchema } from "#episodes/file-info/models";
import { UpdateMetadataProcess } from "#episodes/file-info/update/update-saved-process";
import { Serie } from "#modules/series";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { EpisodesRepository } from "../../crud/repository";
import { diffSerieTree as diffSeriesTree, OldNewSerieTree as OldNew } from "./disk";
import { RemoteSeriesTreeService } from "./db";
import { SerieNode, SerieTree, EpisodeNode } from "./disk/models";
import { AddNewFilesRepository } from "./disk/repository";

const TASK_NAME = EpisodeTasks.sync.name;

export const payloadSchema = z.undefined();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = z.object( {
  percentage: z.number(),
  message: z.string(),
} );
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.object( {
  new: z.array(episodeFileInfoSchema),
  updated: z.array(episodeFileInfoSchema),
} ));

type Payload = z.infer<typeof payloadSchema>;
type Progress = z.infer<typeof progressSchema>;
type Result = z.infer<typeof resultSchema>;

@Injectable()
@TaskHandlerClass()
export class EpisodeUpdateRemoteTaskHandler implements TaskHandler<Payload, Result> {
  constructor(
    private readonly seriesRepo: SeriesRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly savedSerieTreeService: RemoteSeriesTreeService,
    private readonly fileInfoRepo: EpisodeFileInfoRepository,
    private readonly updateMetadataProcess: UpdateMetadataProcess,
    private readonly repo: AddNewFilesRepository,
    private readonly taskService: TaskService,
  ) {
  }

  readonly taskName = TASK_NAME;

  async addTask(
    payload: Payload,
    options?: Partial<TasksCrudDtos.CreateTask.TaskOptions>,
  ) {
    await this.taskService.assertJobIsNotRunningByName(TASK_NAME);

    const job = await this.taskService.addTask<Payload>(
      TASK_NAME,
      payloadSchema.parse(payload),
      {
        ...options,
      },
    );

    return job;
  }

  async execute(_payload: Payload, job: Job): Promise<Result> {
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
          localSeriesTree = await this.repo.getLocalSeriesTree();
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

          const savedData = await this.saveNewFileInfosAndEpisode(diff.new.children);

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
  ): Promise<EpisodeFileInfoEntity[]> {
    const allPromises: Promise<EpisodeFileInfoEntity>[] = [];

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
          const episodePromise = seriePromise.then(
            serie => this.createFileInfoFromLocalEpisode(episodeInTree, serie),
          );

          allPromises.push(episodePromise);
        }
      }
    }

    // Un solo await para todas las promesas
    return await Promise.all(allPromises);
  }

  private async createFileInfoFromLocalEpisode(localEpisode: EpisodeNode, serie: Serie) {
    const episode = {
      compKey: {
        episodeKey: localEpisode.content.episodeKey,
        seriesKey: serie.key,
      },
      title: `${serie.name} ${localEpisode.content.episodeKey}`,
      weight: 0,
    };
    const gotEpisode = await this.episodesRepo.getOneOrCreate(episode);
    const fileInfo: EpisodeFileInfo = {
      ...await this.updateMetadataProcess.episodeFileToFileInfoOmitEpisodeId(localEpisode),
      episodeId: gotEpisode.id,
    };
    const gotFileInfo = await this.fileInfoRepo.createOneAndGet(fileInfo);

    return gotFileInfo;
  }
}
