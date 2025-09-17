/* eslint-disable no-underscore-dangle */
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { MusicTasks } from "$shared/models/musics/admin";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { MusicFileInfoRepository } from "#musics/file-info/crud/repository";
import { TaskHandlerClass, TaskHandler, TaskService } from "#core/tasks";
import { MusicFileInfoOmitMusicIdBuilder } from "#musics/file-info/builder";

const TASK_NAME = MusicTasks.updateFileInfos.name;

export const payloadSchema = z.undefined();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = TasksCrudDtos.TaskStatus.progressSchemaBase;

type Payload = z.infer<typeof payloadSchema>;

type Result = undefined;
export type Progress = z.infer<typeof progressSchema>;

type Internal = Partial<{
  all: MusicFileInfoEntity[];
  i: number;
}>;

type JobWithInternal = Job & {
  data: {
    _internal: Internal;
  };
};

@Injectable()
@TaskHandlerClass()
export class MusicUpdateFileInfoTaskHandler implements TaskHandler<Payload, Result> {
  private readonly logger = new Logger(MusicUpdateFileInfoTaskHandler.name);

  readonly taskName = TASK_NAME;

  constructor(
    private readonly taskService: TaskService,
    private readonly fileInfosRepo: MusicFileInfoRepository,
  ) {}

  async execute(_payload: Payload, job: JobWithInternal): Promise<Result> {
    const all = job.data._internal?.all ?? await this.fileInfosRepo.getAll();

    await this.updateInternal(job, (old)=>( {
      ...old,
      all,
    } ));

    await job.updateProgress( {
      percentage: 1,
      message: "Starting ...",
    } );

    for (let i = job.data._internal?.i ?? 0; i < all.length; i++) {
      const fileInfo = all[i];
      const relativePath = fileInfo.path;

      await job.updateProgress( {
        percentage: 1 + ((99 - 1) * (i / all.length)),
        message: `${i + 1} / ${all.length}: ${relativePath}`,
      } );
      const file = await new MusicFileInfoOmitMusicIdBuilder().withPartial( {
        path: relativePath,
      } )
        .build();

      await this.fileInfosRepo.patchOneByPath(relativePath, file);

      await this.updateInternal(job, (old)=>( {
        ...old,
        i,
      } ));
    }

    await job.updateProgress( {
      percentage: 100,
      message: "Done!",
    } );
  }

  updateInternal(job: JobWithInternal, fn: (old: Internal)=> Internal) {
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
