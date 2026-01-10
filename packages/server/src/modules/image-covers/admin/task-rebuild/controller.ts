import { Controller, Get } from "@nestjs/common";
import z from "zod";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { ImageCoversRebuildAllTaskHandler as EpisodesSyncDiskToDatabaseTaskHandler } from "./task.handler";

@IsAdmin()
@Controller("/rebuild-all")
export class ImageCoversRebuildAllController {
  constructor(
    private readonly taskHandler: EpisodesSyncDiskToDatabaseTaskHandler,
  ) {
  }

  @Get("/")
  @TaskCreatedResponseValidation(z.undefined())
  async syncDiskToDatabase() {
    return {
      job: await this.taskHandler.addTask(undefined),
    };
  }
}
