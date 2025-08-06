import { Controller, Get, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { episodeCompKeySchema } from "#episodes/models";
import { PlayVideoService } from "../play-video.service";
import { QueryDto } from "../play-stream/controller";

class ParamsDto extends createZodDto(episodeCompKeySchema) {}

@Controller("play/episode")
export class PlayEpisodeController {
  constructor(
    private readonly playService: PlayVideoService,
  ) {
  }

  @Get("/:seriesKey/:episodeKey")
  async playEpisode(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
  ) {
    return await this.playService.playEpisode(params, query);
  }
}
