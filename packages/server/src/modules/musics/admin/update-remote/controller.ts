import { Controller, Get } from "@nestjs/common";
import { MusicUpdateRemoteTaskHandler, payloadSchema } from "./task.handler";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";

@IsAdmin()
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
