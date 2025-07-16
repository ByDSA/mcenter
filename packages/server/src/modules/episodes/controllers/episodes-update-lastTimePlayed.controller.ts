import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { EpisodesRepository } from "#episodes/repositories";
import { LastTimePlayedService } from "#episodes/history";

@Controller("/actions/update-last-time-played")
export class EpisodesUpdateLastTimePlayedController {
  constructor(
    private readonly lastTimePlayedService: LastTimePlayedService,
    private readonly episodeRepository: EpisodesRepository,
  ) {
  }

  @Get("/")
  @HttpCode(HttpStatus.OK)
  async action(): Promise<void> {
    const allEpisodes = await this.episodeRepository.getAll();
    const promisesToAwait: Promise<any>[] = [];

    for (const episode of allEpisodes) {
      const updatePromise = this.lastTimePlayedService
        .updateEpisodeLastTimePlayed(episode.id);

      promisesToAwait.push(updatePromise);
    }

    await Promise.all(promisesToAwait);
  }
}
