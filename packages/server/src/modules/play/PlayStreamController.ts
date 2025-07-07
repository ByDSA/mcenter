import { assertFound } from "#shared/utils/http/validation";
import { assertIsDefined } from "#shared/utils/validation";
import { Request } from "express";
import { Controller, Get, Req } from "@nestjs/common";
import { EpisodePickerService } from "#modules/episode-picker";
import { HistoryListService } from "#modules/historyLists";
import { StreamRepository } from "#modules/streams/repositories";
import { PlayService } from "./PlayService";

@Controller()
export class PlayStreamController {
  constructor(
    private playService: PlayService,
    private episodePickerService: EpisodePickerService,
    private streamRepository: StreamRepository,
    private historyListService: HistoryListService,
  ) {
  }

  @Get("/:id/:number?")
  async playStream(@Req() req: Request) {
    const { id, number, force } = validateParams(req);
    const stream = await this.streamRepository.getOneById(id);

    assertFound(stream);

    const episodes = await this.episodePickerService.getByStream(stream, number);
    const ok = await this.playService.play( {
      episodes,
      force,
    } );

    if (ok) {
      await this.historyListService.addEpisodesToHistory( {
        historyListId: stream.id,
        episodes,
      } );
    } else
      console.log("PlayService: Could not play");

    return episodes;
  }
}

function validateParams(req: Request) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id } = req.params;
  const number = +(req.params.number ?? 1);

  assertIsDefined(id);

  return {
    id,
    number,
    force,
  };
}
