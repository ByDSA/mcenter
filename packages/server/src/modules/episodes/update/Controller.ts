import { FullResponse } from "#shared/utils/http";
import { Controller, Get, Req } from "@nestjs/common";
import { UpdateEpisodesFileRequest, assertIsUpdateEpisodesFileRequest } from "./validation";
import { UpdateMetadataProcess } from "./UpdateSavedProcess";

@Controller()
export class EpisodesUpdateController {
  constructor(private updateMetadataProcess: UpdateMetadataProcess) {
  }

  @Get("/saved")
  async endpoint(@Req() req: UpdateEpisodesFileRequest) {
    assertIsUpdateEpisodesFileRequest(req);
    const { forceHash } = req.query;
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
