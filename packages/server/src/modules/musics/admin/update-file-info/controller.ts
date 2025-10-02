import { Controller, Get } from "@nestjs/common";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { MusicUpdateFileInfoTaskHandler, payloadSchema } from "./task.handler";

@IsAdmin()
@Controller("/update-file-infos")
export class MusicUpdateFileInfoController {
  constructor(
    private readonly taskHandler: MusicUpdateFileInfoTaskHandler,
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
