import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { Response, Request } from "express";
import { assertFoundClient } from "#utils/validation/found";
import { MusicsRepository } from "../crud/repository";
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
  ) {
    const format = this.responseFormatter.getResponseFormatByRequest(req);
    let got: MusicEntity | null = await this.musicRepo.getOneBySlug(
      params.slug,
      format === ResponseFormat.RAW
        ? {
          expand: ["fileInfos"],
        }
        : {},
    );

    assertFoundClient(got);

    if (format === ResponseFormat.RAW)
      await this.historyRepo.createNewEntryNowIfShouldFor(got.id);

    return this.renderer.render( {
      music: got,
      format,
      request: req,
      response: res,
    } );
  }
}
