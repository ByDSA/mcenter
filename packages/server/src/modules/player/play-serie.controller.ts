import { Controller, Get, Param, Query } from "@nestjs/common";
import { assertFound } from "$shared/utils/http/validation";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { EpisodeRepository } from "#episodes/index";
import { HistoryListService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { PlayService } from "./PlayService";

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
    private serieRepository: SerieRepository,
    private episodeRepository: EpisodeRepository,
    private playService: PlayService,
    private historyListService: HistoryListService,
  ) {
  }

  static providers = Object.freeze([
    SerieRepository,
    ...SerieRepository.providers,
    EpisodeRepository,
    ...EpisodeRepository.providers,
    PlayService,
    ...PlayService.providers,
    HistoryListService,
    ...HistoryListService.providers,
  ]);

  @Get("/:serieId/:id")
  async playSerie(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
  ) {
    const { force } = query;
    const { id: innerId, serieId } = params;
    const serie = await this.serieRepository.getOneById(serieId);

    assertFound(serie);

    const episode = await this.episodeRepository.getOneById( {
      serieId,
      innerId,
    } );

    assertFound(episode);
    const ok = await this.playService.play( {
      episodes: [episode],
      force,
    } );

    if (ok) {
      await this.historyListService.addEpisodesToHistory( {
        historyListId: serie.id,
        episodes: [episode],
      } );
    } else
      console.log("PlayService: Could not play");

    return episode;
  }
}
