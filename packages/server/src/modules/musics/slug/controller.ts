import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { Response, Request } from "express";
import { Headers } from "@nestjs/common";
import { assertFound } from "#utils/validation/found";
import { MusicsRepository } from "../crud/repository";
import { getResponseFormatByRequest, ResponseFormat } from "../picker/responses";
import { genM3u8View } from "../picker/m3u8.view";
import { MusicEntity } from "../models";
import { SlugHandlerService } from "./service";

class GetDto extends createZodDto(z.object( {
  slug: z.string(),
} ).strict()) {}

@Controller("/")
export class MusicsSlugController {
  constructor(
    private readonly slugHandler: SlugHandlerService,
    private readonly musicRepo: MusicsRepository,
  ) {
  }

  @Get("/:slug")
  async getRaw(
    @Param() params: GetDto,
    @Headers("if-none-match") ifNoneMatch: string,
    @Headers("range") range: string,
     @Res( {
       passthrough: true,
     } ) res: Response,
     @Req() req: Request,
  ) {
    const format = getResponseFormatByRequest(req);
    let picked: MusicEntity | null;

    if (format === ResponseFormat.M3U8 || format === ResponseFormat.JSON) {
      picked = await this.musicRepo.getOneBySlug(params.slug);
      assertFound(picked);
    }

    switch (format) {
      case ResponseFormat.M3U8:
      {
        return genM3u8View( {
          req,
          picked: picked!,
          useNext: false,
        } );
      }
      case ResponseFormat.RAW:
        return await this.slugHandler.handle(params.slug, ifNoneMatch, range, res);
      case ResponseFormat.JSON:
        return picked!;
    }
  }
}
