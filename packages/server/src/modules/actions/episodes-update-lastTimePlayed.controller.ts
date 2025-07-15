import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { EpisodesRepository } from "#episodes/index";
import { SerieRepository } from "#modules/series";
import { StreamsRepository } from "#modules/streams/repositories";
import { LastTimePlayedService } from "#episodes/history";

@Controller("/episodes/updateLastTimePlayed")
export class EpisodesUpdateLastTimePlayedController {
  constructor(
    private readonly lastTimePlayedService: LastTimePlayedService,
    private readonly serieRepository: SerieRepository,
    private readonly episodeRepository: EpisodesRepository,
    private readonly streamRepository: StreamsRepository,
  ) {
  }

  @Get("/")
  @HttpCode(HttpStatus.OK)
  async action(): Promise<void> {
    const series = await this.serieRepository.getAll();
    const promisesToAwait = [];

    for (const serie of series) {
      const promise = this.streamRepository.getManyBySerieId(serie.id).then(async streams => {
        const stream = streams[0];

        if (!stream) {
          console.log(`updateLastTimePlayed ignorado para ${serie.id}: No stream found`);

          return;
        }

        await this.episodeRepository.getAllBySerieId(serie.id).then(episodes => {
          for (const episode of episodes) {
            const updatePromise = this.lastTimePlayedService
              .updateEpisodeLastTimePlayed(episode.id);

            promisesToAwait.push(updatePromise);
          }
        } );
      } );

      promisesToAwait.push(promise);
    }

    await Promise.all(promisesToAwait);
  }
}
