import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { Response, Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { User } from "#core/auth/users/User.decorator";
import { MusicsRepository } from "../crud/repositories/music";
import { ResponseFormat } from "../../resources/response-formatter";
import { MusicFlowService } from "../MusicFlow.service";

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

  @Get("/:slug")
  async getRaw(
    @Param() params: GetDto,
    @Res( {
      passthrough: true,
    } ) res: Response,
    @Req() req: Request,
    @User() user: UserPayload | null,
    @Query("token") token: string | undefined,
    @Query("skip-history") shouldNotAddToHistory: string | undefined,
  ) {
    return await this.flow.fetchAndRender((format)=> {
      return this.musicRepo.getOneBySlug(
        params.slug,
        {
          criteria: format === ResponseFormat.RAW
            ? {
              expand: ["fileInfos"],
            }
            : {},
          requestingUserId: token ?? user?.id,
        },
      );
    }, {
      req,
      res,
      user,
      shouldNotAddToHistory: !!shouldNotAddToHistory,
      token,
    } );
  }
}
