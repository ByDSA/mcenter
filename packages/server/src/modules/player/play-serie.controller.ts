import { Controller, Get, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { assertZod } from "$shared/utils/validation/zod";
import { EpisodesRepository } from "#episodes/repositories";
import { SerieRepository } from "#series/repositories";
import { assertFound } from "#utils/validation/found";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/repositories";
import { episodeCompKeySchema, episodeEntityWithFileInfosSchema } from "#episodes/models";
import { PlayService } from "./PlayService";
import { episodeWithFileInfosToMediaElement } from "./player-services/models";

class ParamsDto extends createZodDto(episodeCompKeySchema) {}
class QueryDto extends createZodDto(z.object( {
  force: z.boolean().optional(),
} )) {}

@Controller("play/episode")
export class PlaySerieController {
  constructor(
    private readonly serieRepository: SerieRepository,
    private readonly episodeRepository: EpisodesRepository,
    private readonly playService: PlayService,
    private readonly entriesRepository: EpisodeHistoryEntriesRepository,
  ) {
  }

  @Get("/:seriesKey/:episodeKey")
  async playSerie(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
  ) {
    const { force } = query;
    const { episodeKey, seriesKey } = params;
    const serie = await this.serieRepository.getOneByKey(seriesKey);

    assertFound(serie);

    const episodeWithFileInfos = await this.episodeRepository
      .getOneByCompKey( {
        seriesKey,
        episodeKey,
      }, {
        expand: ["fileInfos"],
      } );

    assertFound(episodeWithFileInfos);
    assertZod(episodeEntityWithFileInfosSchema, episodeWithFileInfos);

    const mediaElement = episodeWithFileInfosToMediaElement(episodeWithFileInfos);
    const ok = await this.playService.play( {
      mediaElements: [mediaElement],
      force,
    } );

    if (ok)
      await this.entriesRepository.createNewEntryNowFor(episodeWithFileInfos.compKey);
    else
      console.log("PlayService: Could not play");

    return episodeWithFileInfos;
  }
}
