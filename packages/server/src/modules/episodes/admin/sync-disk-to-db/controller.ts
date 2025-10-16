import { Controller, Get } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { User } from "#core/auth/users/User.decorator";
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
  async syncDiskToDatabase(
    @User() user: UserPayload,
  ) {
    return {
      job: await this.taskHandler.addTask( {
        uploaderUserId: user.id,
      } ),
    };
  }
}
