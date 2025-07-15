import { Controller, Get, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { assertFound } from "#utils/validation/found";
import { EpisodePickerService } from "#modules/episode-picker";
import { StreamsRepository } from "#modules/streams/repositories";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/repositories";
import { PlayService } from "./PlayService";

class ParamsDto extends createZodDto(z.object( {
  id: z.string(),
  number: z.coerce.number(),
} )) {}
class QueryDto extends createZodDto(z.object( {
  force: z.boolean().optional(),
} )) {}

@Controller("play/stream")
export class PlayStreamController {
  constructor(
    private readonly playService: PlayService,
    private readonly episodePickerService: EpisodePickerService,
    private readonly streamRepository: StreamsRepository,
    private readonly episodeHistoryEntriesRepository: EpisodeHistoryEntriesRepository,
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
    const stream = await this.streamRepository.getOneById(id);

    assertFound(stream);

    const episodes = await this.episodePickerService.getByStream(stream, number);
    const ok = await this.playService.play( {
      episodes,
      force,
    } );

    if (ok)
      await this.episodeHistoryEntriesRepository.addEpisodesToHistory(episodes);
    else
      console.log("PlayService: Could not play");

    return episodes;
  }
}
