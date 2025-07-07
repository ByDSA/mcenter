import { assertFound } from "#shared/utils/http/validation";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { EpisodeRepository } from "#episodes/index";
import { HistoryListService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { PlayService } from "./PlayService";

@Controller()
export class PlaySerieController {
  constructor(
    private serieRepository: SerieRepository,
    private episodeRepository: EpisodeRepository,
    private playService: PlayService,
    private historyListService: HistoryListService,
  ) {
  }

  @Get("/:name/:id")
  async playSerie(
    @Param() params: any,
    @Query() query: any,
  ) {
    const forceStr = query.force;
    const force = !!forceStr;
    const { id: innerId, name: serieId } = params;
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
