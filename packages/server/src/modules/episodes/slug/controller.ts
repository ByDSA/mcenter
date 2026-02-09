import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { User } from "#core/auth/users/User.decorator";
import { RenderEpisode } from "#episodes/renderer/renderer.interceptor";
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
  @Get("/:seriesKey/:episodeKey")
  async getOneBySlug(
    @Param() params: GetOneByCompKeyParamsDto,
    @Req() req: Request,
    @User() user: UserPayload | null,
    @Query("token") token: string | undefined,
  ) {
    const parsedToken = mongoDbId.or(z.undefined()).parse(token);
    const userId = user?.id ?? parsedToken ?? null;
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
