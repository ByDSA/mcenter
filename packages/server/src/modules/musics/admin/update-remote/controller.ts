import { Controller, Get } from "@nestjs/common";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { MusicUpdateRemoteTaskHandler, payloadSchema } from "./task.handler";

@Controller("/update-remote")
export class MusicUpdateRemoteController {
  constructor(
    private readonly taskHandler: MusicUpdateRemoteTaskHandler,
  ) {
  }

  @Get("/")
  @TaskCreatedResponseValidation(payloadSchema)
  async all() {
    return {
      job: await this.taskHandler.addTask(undefined),
    };
  }
}
