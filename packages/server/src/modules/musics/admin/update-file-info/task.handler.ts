import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { MusicTasks } from "$shared/models/musics/admin";
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

@Injectable()
@TaskHandlerClass()
export class MusicUpdateFileInfoTaskHandler implements TaskHandler<Payload, Result> {
  private readonly logger = new Logger(MusicUpdateFileInfoTaskHandler.name);

  readonly taskName = TASK_NAME;

  constructor(
    private readonly taskService: TaskService,
    private readonly fileInfosRepo: MusicFileInfoRepository,
  ) {}

  async execute(_payload: Payload, job: Job): Promise<Result> {
    const all = await this.fileInfosRepo.getAll();
    let i = 0;

    await job.updateProgress( {
      percentage: 1,
      message: "Starting ...",
    } );

    for (const fileInfo of all) {
      const relativePath = fileInfo.path;

      await job.updateProgress( {
        percentage: 1 + ((99 - 1) * (i / all.length)),
        message: `${++i} / ${all.length}: ${relativePath}`,
      } );
      const file = await new MusicFileInfoOmitMusicIdBuilder().withPartial( {
        path: relativePath,
      } )
        .build();

      await this.fileInfosRepo.patchOneByPath(relativePath, file);
    }

    await job.updateProgress( {
      percentage: 100,
      message: "Done!",
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
