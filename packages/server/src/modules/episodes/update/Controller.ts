import { Controller, Get, Query } from "@nestjs/common";
import { FullResponse } from "$shared/utils/http";
import { UpdateEpisodesFileReqQueryDto } from "./validation";
import { UpdateMetadataProcess } from "./UpdateSavedProcess";

@Controller("/episodes/file-info/update")
export class EpisodesUpdateController {
  constructor(private updateMetadataProcess: UpdateMetadataProcess) {
  }

  @Get("/saved")
  async endpoint(@Query() query: UpdateEpisodesFileReqQueryDto) {
    const { forceHash } = query;
    const { errors, data } = await this.updateMetadataProcess.process( {
      forceHash: forceHash === "1" || forceHash === "true",
    } );
    const responseObj: FullResponse = {
      data,
      errors,
    };

    return responseObj;
  }
}
