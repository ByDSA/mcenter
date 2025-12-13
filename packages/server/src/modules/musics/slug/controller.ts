import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { Response, Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { User } from "#core/auth/users/User.decorator";
import { assertFoundClient } from "#utils/validation/found";
import { MusicsRepository } from "../crud/repositories/music";
import { ResponseFormat, ResponseFormatterService } from "../../resources/response-formatter";
import { MusicEntity } from "../models";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicRendererService } from "../renderer/render.service";

class GetDto extends createZodDto(z.object( {
  slug: z.string(),
} ).strict()) {}

@Controller("/")
export class MusicsSlugController {
  constructor(
    private readonly musicRepo: MusicsRepository,
    private readonly historyRepo: MusicHistoryRepository,
    private readonly renderer: MusicRendererService,
    private readonly responseFormatter: ResponseFormatterService,
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
  ) {
    mongoDbId.or(z.undefined()).parse(token);
    const format = this.responseFormatter.getResponseFormatByRequest(req);
    let got: MusicEntity | null = await this.musicRepo.getOneBySlug(
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

    assertFoundClient(got);

    if (format === ResponseFormat.RAW) {
      const userId = user?.id ?? token;

      if (userId) {
        await this.historyRepo.createNewEntryNowIfShouldFor( {
          musicId: got.id,
          userId,
        } );
      }
    }

    return this.renderer.render( {
      music: got,
      format,
      request: req,
      response: res,
    } );
  }
}
