import { Controller, Get, Query } from "@nestjs/common";
import { DataResponse } from "$shared/utils/http";
import { UpdateEpisodesFileReqQueryDto } from "./validation";
import { UpdateMetadataProcess } from "./UpdateSavedProcess";

@Controller("/episodes/file-info/update")
export class EpisodesUpdateController {
  constructor(private readonly updateMetadataProcess: UpdateMetadataProcess) {
  }

  @Get("/saved")
  async endpoint(@Query() query: UpdateEpisodesFileReqQueryDto) {
    const { forceHash } = query;
    const { errors, data } = await this.updateMetadataProcess.process( {
      forceHash: forceHash === "1" || forceHash === "true",
    } );
    const responseObj: DataResponse = {
      data,
      errors,
    };

    return responseObj;
  }
}
