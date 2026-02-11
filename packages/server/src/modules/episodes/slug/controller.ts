import { Controller, Get, Param, Req } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { User } from "#core/auth/users/User.decorator";
import { RenderEpisode } from "#episodes/renderer/renderer.decorator";
import { TokenAuth } from "#core/auth/strategies/token/decorator";
import { EpisodeSlugHandlerService } from "./service";

class GetOneByCompKeyParamsDto extends createZodDto(
  EpisodesCrudDtos.GetOne.ByCompKey.paramsSchema,
) {}

@Controller()
export class EpisodesSlugController {
  constructor(
     private readonly handler: EpisodeSlugHandlerService,
  ) {
  }

  @RenderEpisode( {
    json: true,
    m3u8: true,
    raw: true,
  } )
  @TokenAuth()
  @Get("/:seriesKey/:episodeKey")
  async getOneBySlug(
    @Param() params: GetOneByCompKeyParamsDto,
    @Req() req: Request,
    @User() user: UserPayload | null,
  ) {
    const userId = user?.id ?? null;
    const format = this.handler.getFormat(req);
    const episode = await this.handler.fetchEpisodeByFormat( {
      seriesKey: params.seriesKey,
      episodeKey: params.episodeKey,
      format,
      userId,
    } );

    return episode;
  }
}
