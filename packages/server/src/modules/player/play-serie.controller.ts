import { Controller, Get, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { PlayService } from "./PlayService";
import { EpisodesRepository } from "#episodes/repositories";
import { SerieRepository } from "#series/repositories";
import { assertFound } from "#utils/validation/found";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/repositories";

class ParamsDto extends createZodDto(z.object( {
  id: z.string(),
  serieId: z.string(),
} )) {}
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

  @Get("/:serieId/:id")
  async playSerie(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
  ) {
    const { force } = query;
    const { id: code, serieId } = params;
    const serie = await this.serieRepository.getOneById(serieId);

    assertFound(serie);

    const episode = await this.episodeRepository.getOneById( {
      serieId,
      code,
    } );

    assertFound(episode);
    const ok = await this.playService.play( {
      episodes: [episode],
      force,
    } );

    if (ok)
      await this.entriesRepository.createNewEntryNowFor(episode.id);
    else
      console.log("PlayService: Could not play");

    return episode;
  }
}
