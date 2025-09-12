import { Controller, Get, Query } from "@nestjs/common";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { UpdateEpisodesFileReqQueryDto } from "./validation";
import { EpisodeUpdateFileInfoSavedTaskHandler, payloadSchema } from "./task.handler";

@Controller("/admin/file-info/update")
export class EpisodesUpdateController {
  constructor(private readonly taskHandler: EpisodeUpdateFileInfoSavedTaskHandler) {
  }

  @Get("/saved")
  @TaskCreatedResponseValidation(payloadSchema)
  async task(@Query() query: UpdateEpisodesFileReqQueryDto) {
    const { forceHash } = query;

    return {
      job: await this.taskHandler.addTask( {
        forceHash: forceHash === "1" || forceHash === "true",
      } ),
    };
  }
}
