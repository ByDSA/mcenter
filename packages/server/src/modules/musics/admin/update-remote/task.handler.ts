import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { MusicTasks } from "$shared/models/musics/admin";
import { TaskHandlerClass, TaskHandler, TaskService } from "#core/tasks";
import { UpdateRemoteTreeService, type UpdateResult } from "./service";

const TASK_NAME = MusicTasks.sync.name;

export const payloadSchema = z.object( {
  userId: z.string(),
} );
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = TasksCrudDtos.TaskStatus.progressSchemaBase;

type Payload = z.infer<typeof payloadSchema>;

type Result = UpdateResult;
export type Progress = z.infer<typeof progressSchema>;

@Injectable()
@TaskHandlerClass()
export class MusicUpdateRemoteTaskHandler implements TaskHandler<Payload, Result> {
  private readonly logger = new Logger(MusicUpdateRemoteTaskHandler.name);

  readonly taskName = TASK_NAME;

  constructor(
    private readonly taskService: TaskService,
    private readonly service: UpdateRemoteTreeService,
  ) {}

  async execute(payload: Payload, job: Job): Promise<Result> {
    const ret = await this.service.update( {
      job,
      userId: payload.userId,
    } );

    return ret;
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
