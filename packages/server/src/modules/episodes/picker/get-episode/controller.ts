import { Controller, Get, Param } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { User } from "#core/auth/users/User.decorator";
import { M3u8FormatUseNext } from "#modules/resources/response-formatter";
import { RenderEpisode } from "#episodes/renderer/renderer.decorator";
import { TokenAuth } from "#core/auth/strategies/token/decorator";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { StreamGetRandomEpisodeService } from "./service";

class GetEpisodeParams extends createZodDto(z.object( {
  streamKey: z.string(),
} )) {}

@Controller("/get-episode")
export class StreamGetEpisodeController {
  constructor(
     private readonly service: StreamGetRandomEpisodeService,
  ) { }

  @RenderEpisode( {
    json: true,
    m3u8: true,
  } )
  @M3u8FormatUseNext()
  @Authenticated()
  @TokenAuth()
  @Get("/:streamKey")
  async getEpisode(
    @Param() params: GetEpisodeParams,
    @User() user: UserPayload,
  ) {
    const userId = user.id;
    const [episode] = await this.service.getByStreamKey(userId, params.streamKey, 1);

    return episode;
  }
}
