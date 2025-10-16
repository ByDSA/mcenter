import { Controller, Get } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { User } from "#core/auth/users/User.decorator";
import { MusicUpdateRemoteTaskHandler, payloadSchema } from "./task.handler";

@IsAdmin()
@Controller("/update-remote")
export class MusicUpdateRemoteController {
  constructor(
    private readonly taskHandler: MusicUpdateRemoteTaskHandler,
  ) {
  }

  @Get("/")
  @TaskCreatedResponseValidation(payloadSchema)
  async all(
    @User() user: UserPayload,
  ) {
    return {
      job: await this.taskHandler.addTask( {
        userId: user.id,
      } ),
    };
  }
}
