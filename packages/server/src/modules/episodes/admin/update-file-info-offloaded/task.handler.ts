/* eslint-disable no-underscore-dangle */
import { Injectable, Logger } from "@nestjs/common";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { tasksEpisodes } from "$shared/models/episodes/admin";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { assertIsDefined } from "$shared/utils/validation";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { EpisodeFileInfoEntity, episodeFileInfoEntitySchema } from "#episodes/file-info/models";
import { EpisodeFileInfoSyncService } from "#episodes/file-info/sync/service";

const TASK_NAME = tasksEpisodes.fileInfoUpdateOffloaded.name;

export const payloadSchema = z.union([
  z.object( {
    ids: mongoDbId.array().nonempty(),
    all: z.undefined(),
  } ),
  z.object( {
    ids: z.undefined(),
    all: z.boolean(),
  } ),
]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = TasksCrudDtos.TaskStatus.progressSchemaBase;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.object( {
  markedOffloaded: z.array(episodeFileInfoEntitySchema),
  unmarkedOffloaded: z.array(episodeFileInfoEntitySchema),
  skipped: z.number(),
} ));

type Payload = z.infer<typeof payloadSchema>;
type Progress = z.infer<typeof progressSchema>;
type Result = z.infer<typeof resultSchema>;

type Internal = Partial<{
  all: EpisodeFileInfoEntity[];
  i: number;
}>;

type JobWithInternal = Job & {
  data: {
    _internal: Internal;
  };
};

@Injectable()
@TaskHandlerClass()
export class EpisodeUpdateFileInfoOffloadedTaskHandler implements TaskHandler<Payload, Result> {
  private readonly logger = new Logger(EpisodeUpdateFileInfoOffloadedTaskHandler.name);

  readonly taskName = TASK_NAME;

  constructor(
    private readonly taskService: TaskService,
    private readonly fileInfosRepo: EpisodeFileInfoRepository,
    private readonly fileInfosSyncService: EpisodeFileInfoSyncService,
  ) {}

  async execute(payload: Payload, job: JobWithInternal): Promise<Result> {
    let all = job.data._internal?.all;

    if (!all) {
      if (payload.all)
        all = await this.fileInfosRepo.getAll();
      else if (payload.ids)
        all = await this.fileInfosRepo.getManyByIds(payload.ids);
    }

    assertIsDefined(all); // guard por si el payload fuera inválido pese al zod

    await this.updateInternal(job, (old) => ( {
      ...old,
      all,
    } ));

    await job.updateProgress( {
      percentage: 1,
      message: "Starting ...",
    } as Progress);

    const markedOffloaded: EpisodeFileInfoEntity[] = [];
    const unmarkedOffloaded: EpisodeFileInfoEntity[] = [];
    let skipped = 0;

    for (let i = job.data._internal?.i ?? 0; i < all.length; i++) {
      const fileInfo = all[i];
      const relativePath = fileInfo.path;

      await job.updateProgress( {
        percentage: 1 + ((99 - 1) * (i / all.length)),
        message: `${i + 1} / ${all.length}: ${relativePath}`,
      } as Progress);

      const ret = await this.fileInfosSyncService.syncOffloaded(fileInfo);

      if (ret === null)
        skipped++;
      else if (ret === "marked")
        markedOffloaded.push(fileInfo);
      else if (ret === "unmarked")
        unmarkedOffloaded.push(fileInfo);

      await this.updateInternal(job, (old) => ( {
        ...old,
        i,
      } ));
    }

    await job.updateProgress( {
      percentage: 100,
      message: "Done!",
    } as Progress);

    return {
      data: {
        markedOffloaded,
        unmarkedOffloaded,
        skipped,
      },
    } as Result;
  }

  private updateInternal(job: JobWithInternal, fn: (old: Internal)=> Internal) {
    const _internal: Internal = job.data._internal ? fn(job.data._internal) : fn( {} );

    return job.updateData( {
      ...job.data,
      _internal,
    } );
  }

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
}
