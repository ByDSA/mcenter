import { Controller, Get, Logger, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { assertZod } from "$shared/utils/validation/zod";
import { assertFound } from "#utils/validation/found";
import { EpisodePickerService } from "#modules/episode-picker";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/crud/repository";
import { episodeEntityWithFileInfosSchema } from "#episodes/models";
import { EpisodeEntityWithFileInfos } from "#episodes/file-info/series-tree/remote/service";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { PlayService } from "./play.service";
import { episodeWithFileInfosToMediaElement } from "./player-services/models";

class ParamsDto extends createZodDto(z.object( {
  id: z.string(),
  number: z.coerce.number(),
} )) {}
class QueryDto extends createZodDto(z.object( {
  force: z.boolean().optional(),
} )) {}

@Controller("play/stream")
export class PlayStreamController {
  private readonly logger = new Logger(PlayStreamController.name);

  constructor(
    private readonly playService: PlayService,
    private readonly episodePickerService: EpisodePickerService,
    private readonly streamRepository: StreamsRepository,
    private readonly episodeHistoryEntriesRepository: EpisodeHistoryEntriesRepository,
    private readonly episodeFileInfosRepo: EpisodeFileInfoRepository,
  ) {
  }

    @Get("/:id")
  async playStreamDefault(
    @Param("id") id: string,
    @Query() query: QueryDto,
  ) {
    return await this.playStreamWithNumber(id, 1, query);
  }

  @Get("/:id/:number")
    async playStream(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
    ) {
      const { id, number = 1 } = params;

      return await this.playStreamWithNumber(id, number, query);
    }

  private async playStreamWithNumber(
    id: string,
    number: number,
    query: QueryDto,
  ) {
    const { force } = query;
    const stream = await this.streamRepository.getOneByKey(id);

    assertFound(stream);

    const episodes = await this.episodePickerService.getByStream(stream, number);
    const promises: Promise<any>[] = [];

    for (const e of episodes) {
      const p = this.episodeFileInfosRepo.getAllByEpisodeId(e.id)
        .then(fileInfos=>e.fileInfos = fileInfos);

      promises.push(p);
    }

    await Promise.all(promises);
    const episodesWithFileInfos = episodes as EpisodeEntityWithFileInfos[];

    assertZod(z.array(episodeEntityWithFileInfosSchema), episodesWithFileInfos);
    const mediaElements = episodesWithFileInfos.map(episodeWithFileInfosToMediaElement);
    const ok = await this.playService.play( {
      mediaElements,
      force,
    } );

    if (ok) {
      await this.episodeHistoryEntriesRepository.addEpisodesToHistory( {
        episodes: episodesWithFileInfos,
        streamId: stream.id,
      } );
    } else
      this.logger.log("Could not play");

    return episodesWithFileInfos;
  }
}
