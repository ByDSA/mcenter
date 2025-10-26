import { Injectable } from "@nestjs/common";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { EpisodeTasks } from "$shared/models/episodes/admin";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { LastTimePlayedService } from "#episodes/history/last-time-played.service";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";

const TASK_NAME = EpisodeTasks.cache.updateLastTimePlayed.name;

export const payloadSchema = z.undefined();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = TasksCrudDtos.TaskStatus.progressSchemaBase;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.object( {
  changes: z.array(z.object( {
    id: z.string(),
    description: z.string(),
    old: z.number().optional(),
    new: z.number().nullable(),
  } )),
} ));

type Payload = z.infer<typeof payloadSchema>;
type Progress = z.infer<typeof progressSchema>;
type Result = z.infer<typeof resultSchema>;

@Injectable()
@TaskHandlerClass()
export class EpisodeUpdateLastTimePlayedTaskHandler implements TaskHandler<Payload, Result> {
  constructor(
    private readonly lastTimePlayedService: LastTimePlayedService,
    private readonly episodesUsersRepo: EpisodesUsersRepository,
    private readonly taskService: TaskService,
  ) { }

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

  async execute(_payload: Payload, job: Job): Promise<Result> {
    const updateProgress = async (p: Progress) => {
      return await job.updateProgress(p);
    };

    await updateProgress( {
      message: "Starting",
      percentage: 0,
    } );
    const allUserInfos = await this.episodesUsersRepo.getAll();
    const promisesToAwait: Promise<any>[] = [];
    const data: Result["data"] = {
      changes: [],
    };

    for (const userInfo of allUserInfos) {
      const updatePromise = this.lastTimePlayedService
        .updateEpisodeLastTimePlayedById(userInfo.userId, userInfo.episodeId)
        .then(n=> {
          if (n !== (userInfo.lastTimePlayed ?? null)) {
            data.changes.push( {
              id: userInfo.id,
              description:
                `episodeId=${userInfo.id} userId=${userInfo.userId}`,
              new: n,
              old: userInfo.lastTimePlayed,
            } );
          }
        } );

      promisesToAwait.push(updatePromise);
    }

    await Promise.all(promisesToAwait);

    await updateProgress( {
      message: "Done!",
      percentage: 100,
    } );

    return {
      data,
    };
  }
}
