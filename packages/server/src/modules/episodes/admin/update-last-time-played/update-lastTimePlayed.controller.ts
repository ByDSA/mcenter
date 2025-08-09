import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { EpisodesRepository } from "../../crud/repository";
import { LastTimePlayedService } from "../../history";

@Controller("/actions/update-last-time-played")
export class EpisodesUpdateLastTimePlayedController {
  constructor(
    private readonly lastTimePlayedService: LastTimePlayedService,
    private readonly episodeRepo: EpisodesRepository,
  ) {
  }

  @Get("/")
  @HttpCode(HttpStatus.OK)
  async action(): Promise<void> {
    const allEpisodes = await this.episodeRepo.getAll();
    const promisesToAwait: Promise<any>[] = [];

    for (const episode of allEpisodes) {
      const updatePromise = this.lastTimePlayedService
        .updateEpisodeLastTimePlayedByCompKey(episode.compKey);

      promisesToAwait.push(updatePromise);
    }

    await Promise.all(promisesToAwait);
  }
}
