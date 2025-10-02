import { Controller, Get } from "@nestjs/common";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { EpisodeUpdateRemoteTaskHandler as EpisodesSyncDiskToDatabaseTaskHandler, payloadSchema } from "./task.handler";

@IsAdmin()
@Controller("/admin/add-new-files")
export class EpisodesSyncDiskToDatabaseController {
  constructor(
    private readonly taskHandler: EpisodesSyncDiskToDatabaseTaskHandler,
  ) {
  }

  @Get("/")
  @TaskCreatedResponseValidation(payloadSchema)
  async syncDiskToDatabase() {
    return {
      job: await this.taskHandler.addTask(undefined),
    };
  }
}
