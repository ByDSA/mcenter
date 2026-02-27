import { execSync } from "node:child_process";
import { Injectable } from "@nestjs/common";
import { createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { tasksYoutube } from "$shared/models/youtube/tasks";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";

const TASK_NAME = tasksYoutube.updateYtDlp.name;

export const payloadSchema = z.undefined();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.object( {
  stdout: z.string(),
} ));

type Payload = z.infer<typeof payloadSchema>;
type Result = z.infer<typeof resultSchema>;

@Injectable()
@TaskHandlerClass()
export class UpdateYtDlpTaskHandler implements TaskHandler<Payload, Result> {
  readonly taskName = TASK_NAME;

  constructor(private readonly taskService: TaskService) { }

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

  // eslint-disable-next-line require-await
  async execute(_payload: Payload, _job: Job): Promise<Result> {
    try {
      const stdout = execSync("yt-dlp -U", {
        encoding: "utf-8",
      } );

      return {
        data: {
          stdout,
        },
      };
    } catch (error) {
      const stdout = (error as any).stdout?.toString();
      let errors: ResultResponse["errors"];

      if (error instanceof Error) {
        errors = [{
          type: error.name,
          message: error.message,
        }];
      }

      return {
        data: {
          stdout,
        },
        errors,
      };
    }
  }
}
