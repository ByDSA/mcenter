import { Controller, Get, Logger, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { assertZod } from "$shared/utils/validation/zod";
import { mediaElementFixPlayerLabels } from "$shared/models/resources";
import { assertFound } from "#utils/validation/found";
import { EpisodePickerService } from "#modules/episode-picker";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { episodeEntityWithFileInfosSchema } from "#episodes/models";
import { EpisodeEntityWithFileInfos } from "#episodes/file-info/series-tree/remote/service";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { episodeToMediaElement } from "./player-services/models";
import { PlayService } from "./play.service";

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
    private readonly streamsRepo: StreamsRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
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
    const stream = await this.streamsRepo.getOneByKey(id);

    assertFound(stream);

    const episodes = await this.episodePickerService.getByStream(stream, number, {
      expand: ["series", "fileInfos"],
    } ) as EpisodeEntityWithFileInfos[];

    assertZod(z.array(episodeEntityWithFileInfosSchema), episodes);
    const mediaElements = episodes.map((e)=>{
      const mediaElement = episodeToMediaElement(e, {
        local: true,
      } );

      return mediaElementFixPlayerLabels(mediaElement);
    } );
    const ok = await this.playService.play( {
      mediaElements,
      force,
    } );

    if (ok) {
      await this.historyRepo.addEpisodesToHistory( {
        episodes,
        streamId: stream.id,
      } );
    } else
      this.logger.log("Could not play");

    return episodes;
  }
}
