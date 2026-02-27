import { Injectable } from "@nestjs/common";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { tasksMeilisearch } from "$shared/models/tasks-meilisearch";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { IndexSyncService } from "#modules/search/admin/sync-indexes/sync-all.service";

const TASK_NAME = tasksMeilisearch.syncIndexes.name;
const payloadSchema = z.undefined();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.object( {
  musics: z.object( {
    total: z.number(),
  } ),
} ));

type Payload = z.infer<typeof payloadSchema>;
type Result = z.infer<typeof resultSchema>;

@Injectable()
@TaskHandlerClass()
export class SyncMeilisearchIndexesTaskHandler implements TaskHandler<Payload, Result> {
  readonly taskName = TASK_NAME;

  constructor(
    private readonly taskService: TaskService,
    private readonly indexSyncService: IndexSyncService,
  ) { }

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

  async execute(_payload: Payload, _job: Job): Promise<Result> {
    return {
      data: await this.indexSyncService.syncAll(),
    };
  }
}
