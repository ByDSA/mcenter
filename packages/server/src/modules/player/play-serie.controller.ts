import { Controller, Get, Logger, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { assertZod } from "$shared/utils/validation/zod";
import { EpisodesRepository } from "#episodes/crud/repository";
import { SeriesRepository } from "#modules/series/crud/repository";
import { assertFound } from "#utils/validation/found";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { episodeCompKeySchema, episodeEntityWithFileInfosSchema } from "#episodes/models";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { PlayService } from "./play.service";
import { episodeWithFileInfosToMediaElement } from "./player-services/models";

class ParamsDto extends createZodDto(episodeCompKeySchema) {}
class QueryDto extends createZodDto(z.object( {
  force: z.boolean().optional(),
} )) {}

@Controller("play/episode")
export class PlaySerieController {
  private readonly logger = new Logger(PlaySerieController.name);

  constructor(
    private readonly seriesRepo: SeriesRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly playService: PlayService,
    private readonly historyEntriesRepo: EpisodeHistoryRepository,
    private readonly streamsRepo: StreamsRepository,
  ) {
  }

  @Get("/:seriesKey/:episodeKey")
  async playSerie(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
  ) {
    const { force } = query;
    const { episodeKey, seriesKey } = params;
    const serie = await this.seriesRepo.getOneByKey(seriesKey);

    assertFound(serie);

    const episodeWithFileInfos = await this.episodesRepo
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

    if (ok) {
      const stream = await this.streamsRepo.getOneOrCreateBySeriesKey(seriesKey);

      await this.historyEntriesRepo.createNewEntryNowFor( {
        episodeCompKey: episodeWithFileInfos.compKey,
        streamId: stream.id,
      } );
    } else
      this.logger.log("Could not play");

    return episodeWithFileInfos;
  }
}
