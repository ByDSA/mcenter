import { Controller, Get, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { QueryDto } from "../play-stream/controller";
import { PlayMusicService } from "./service";

class ParamsDto extends createZodDto(z.object( {
  slug: z.string(),
} )) {}

@Controller("play/music")
export class PlayMusicController {
  constructor(
    private readonly playService: PlayMusicService,
  ) { }

  @Get("/:slug")
  async playMusic(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
  ) {
    return await this.playService.playMusic(params.slug, query);
  }
}
