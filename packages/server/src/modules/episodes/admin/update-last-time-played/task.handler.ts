import { Injectable } from "@nestjs/common";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { EpisodeTasks } from "$shared/models/episodes/admin";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { LastTimePlayedService } from "#episodes/history/last-time-played.service";
import { EpisodesRepository } from "../../crud/repository";

const TASK_NAME = EpisodeTasks.cache.updateLastTimePlayed.name;

export const payloadSchema = z.undefined();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = z.object( {
  percentage: z.number(),
  message: z.string(),
} );
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.object( {
  changes: z.array(z.object(
    {
      old: z.number().optional(),
      new: z.number().nullable(),
    },
  )),
} ));

type Payload = z.infer<typeof payloadSchema>;
type Progress = z.infer<typeof progressSchema>;
type Result = z.infer<typeof resultSchema>;

@Injectable()
@TaskHandlerClass()
export class EpisodeUpdateLastTimePlayedTaskHandler implements TaskHandler<Payload, Result> {
  constructor(
    private readonly lastTimePlayedService: LastTimePlayedService,
    private readonly episodeRepo: EpisodesRepository,
    private readonly taskService: TaskService,
  ) { }

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
    const allEpisodes = await this.episodeRepo.getAll();
    const promisesToAwait: Promise<any>[] = [];
    const data: Result["data"] = {
      changes: [],
    };

    for (const episode of allEpisodes) {
      const updatePromise = this.lastTimePlayedService
        .updateEpisodeLastTimePlayedByCompKey(episode.compKey)
        .then(n=> {
          if (n !== (episode.lastTimePlayed ?? null)) {
            data.changes.push( {
              new: n,
              old: episode.lastTimePlayed,
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
