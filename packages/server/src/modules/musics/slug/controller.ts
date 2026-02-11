import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { User } from "#core/auth/users/User.decorator";
import { TokenAuth } from "#core/auth/strategies/token/decorator";
import { MusicsRepository } from "../crud/repositories/music";
import { ResponseFormat } from "../../resources/response-formatter";
import { MusicFlowService } from "../MusicFlow.service";
import { RenderMusic } from "../renderer/renderer.interceptor";

class GetDto extends createZodDto(z.object( {
  slug: z.string(),
} ).strict()) {}

@Controller("/")
export class MusicsSlugController {
  constructor(
    private readonly musicRepo: MusicsRepository,
    private readonly flow: MusicFlowService,
  ) {
  }

  @RenderMusic( {
    json: true,
    m3u8: true,
    raw: true,
  } )
  @TokenAuth()
  @Get("/:slug")
  async getRaw(
    @Param() params: GetDto,
    @Req() req: Request,
    @User() user: UserPayload | null,
    @Query("skip-history") shouldNotAddToHistory: string | undefined,
  ) {
    return await this.flow.validateParamsAndFetchMusicAndUpdateHistory((format)=> {
      return this.musicRepo.getOneBySlug(
        params.slug,
        {
          criteria: format === ResponseFormat.RAW
            ? {
              expand: ["fileInfos"],
            }
            : {},
          requestingUserId: user?.id,
        },
      );
    }, {
      req,
      user,
      shouldNotAddToHistory: !!shouldNotAddToHistory,
    } );
  }
}
