import { Controller, Get, Query } from "@nestjs/common";
import { ResultResponse } from "$shared/utils/http";
import { UpdateEpisodesFileReqQueryDto } from "./validation";
import { UpdateMetadataProcess } from "./update-saved-process";

@Controller("/actions/file-info/update")
export class EpisodesUpdateController {
  constructor(private readonly updateMetadataProcess: UpdateMetadataProcess) {
  }

  @Get("/saved")
  async endpoint(@Query() query: UpdateEpisodesFileReqQueryDto) {
    const { forceHash } = query;
    const { errors, data } = await this.updateMetadataProcess.process( {
      forceHash: forceHash === "1" || forceHash === "true",
    } );
    const responseObj: ResultResponse = {
      data,
      errors,
    };

    return responseObj;
  }
}
