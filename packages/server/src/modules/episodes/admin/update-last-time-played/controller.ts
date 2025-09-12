import { Controller, Get } from "@nestjs/common";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { EpisodeUpdateLastTimePlayedTaskHandler, payloadSchema } from "./task.handler";

@Controller("/admin/update-last-time-played")
export class EpisodesUpdateLastTimePlayedController {
  constructor(
    private readonly taskHandler: EpisodeUpdateLastTimePlayedTaskHandler,
  ) {
  }

  @Get("/")
  @TaskCreatedResponseValidation(payloadSchema)
  async task() {
    return {
      job: await this.taskHandler.addTask(undefined),
    };
  }
}
