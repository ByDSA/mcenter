import { Controller, Get, Param, Res } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { Response } from "express";
import { Headers } from "@nestjs/common";
import { RawHandlerService } from "./service";

class GetRawDto extends createZodDto(z.object( {
  url: z.string(),
} ).strict()) {}

@Controller("/")
export class MusicGetRawController {
  constructor(
    private readonly rawHandler: RawHandlerService,
  ) {
  }

  @Get("/:url")
  async getRaw(
    @Param() params: GetRawDto,
    @Headers("if-none-match") ifNoneMatch: string,
    @Headers("range") range: string,
     @Res( {
       passthrough: true,
     } ) res: Response,
  ) {
    return await this.rawHandler.handle(params.url, ifNoneMatch, range, res);
  }
}
