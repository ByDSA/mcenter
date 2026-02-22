import { Body, Controller, Get, Post } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { EpisodeUpdateFileInfoOffloadedTaskHandler, payloadSchema } from "./task.handler";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";

class PostBodyDto extends createZodDto(z.object( {
  ids: mongoDbId.array().nonempty(),
} )) {}

@IsAdmin()
@Controller("/admin/file-info/update/offloaded")
export class EpisodesUpdateFileInfoOffloadedController {
  constructor(private readonly taskHandler: EpisodeUpdateFileInfoOffloadedTaskHandler) {}

  @Get()
  @TaskCreatedResponseValidation(payloadSchema)
  async task() {
    return {
      job: await this.taskHandler.addTask( {
        all: true,
      } ),
    };
  }

  @Post()
  @TaskCreatedResponseValidation(payloadSchema)
  async postTask(
    @Body() body: PostBodyDto,
  ) {
    return {
      job: await this.taskHandler.addTask( {
        ids: body.ids,
      } ),
    };
  }
}
