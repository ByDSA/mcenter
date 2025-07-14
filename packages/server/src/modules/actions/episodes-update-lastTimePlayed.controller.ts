import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { EpisodeRepository } from "#episodes/index";
import { SerieRepository } from "#modules/series";
import { StreamsRepository } from "#modules/streams/repositories";
import { EpisodeHistoryListRepository, LastTimePlayedService } from "#episodes/history";

@Controller("/episodes/updateLastTimePlayed")
export class EpisodesUpdateLastTimePlayedController {
  constructor(
    private lastTimePlayedService: LastTimePlayedService,
    private serieRepository: SerieRepository,
    private episodeRepository: EpisodeRepository,
    private historyListRepository: EpisodeHistoryListRepository,
    private streamRepository: StreamsRepository,
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

        const historyList = await this.historyListRepository.getOneByIdOrCreate(stream.id);

        await this.episodeRepository.getAllBySerieId(serie.id).then(episodes => {
          for (const episode of episodes) {
            const updatePromise = this.lastTimePlayedService
              .updateEpisodeLastTimePlayedFromEntriesAndGet( {
                episodeId: episode.id,
                entries: historyList.entries,
              } );

            promisesToAwait.push(updatePromise);
          }
        } );
      } );

      promisesToAwait.push(promise);
    }

    await Promise.all(promisesToAwait);
  }
}
