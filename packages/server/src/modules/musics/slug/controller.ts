import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { Response, Request } from "express";
import { getHostFromRequest } from "$shared/models/resources";
import { assertFoundClient } from "#utils/validation/found";
import { validateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { MusicsRepository } from "../crud/repository";
import { ResponseFormat, ResponseFormatterService } from "../../resources/response-formatter";
import { MusicEntity, musicEntitySchema } from "../models";
import { MusicSlugHandlerService } from "./service";

class GetDto extends createZodDto(z.object( {
  slug: z.string(),
} ).strict()) {}

@Controller("/")
export class MusicsSlugController {
  constructor(
    private readonly slugHandler: MusicSlugHandlerService,
    private readonly musicRepo: MusicsRepository,
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
    let got: MusicEntity | null;

    if (format === ResponseFormat.M3U8 || format === ResponseFormat.JSON) {
      got = await this.musicRepo.getOneBySlug(params.slug);
      assertFoundClient(got);
    }

    switch (format) {
      case ResponseFormat.M3U8:
        return this.responseFormatter.formatOneRemoteM3u8Response(
          got!,
          getHostFromRequest(req),
        );
      case ResponseFormat.RAW:
        return await this.slugHandler.handle(params.slug, req, res);
      case ResponseFormat.JSON:
      {
        const json = this.responseFormatter.formatOneJsonResponse(got!, res);

        validateResponseWithZodSchema(json.data, musicEntitySchema, req);

        return json;
      }
    }
  }
}
