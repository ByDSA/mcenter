import type { QueryDto } from "./play-stream/controller";
import { Injectable } from "@nestjs/common";
import { EpisodeEntityWithFileInfos } from "$shared/models/episodes";
import { episodeToMediaElement } from "$shared/models/player";
import { mediaElementFixPlayerLabels } from "$shared/models/resources";
import { assertFoundClient, assertIsNotEmptyClient } from "#utils/validation/found";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { EpisodePickerService } from "#modules/episode-picker";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { EpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { EpisodesRepository } from "#episodes/crud/repository";
import { SeriesRepository } from "#modules/series/crud/repository";
import { PlayService } from "./play.service";

@Injectable()
export class PlayVideoService {
  constructor(
    private readonly episodePickerService: EpisodePickerService,
    private readonly streamsRepo: StreamsRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
    private readonly seriesRepo: SeriesRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly playService: PlayService,
  ) { }

  private async processAndPlayEpisodes(
    remotePlayerId: string,
    episodes: EpisodeEntityWithFileInfos[],
    streamId: string,
    force?: boolean,
  ): Promise<EpisodeEntityWithFileInfos[]> {
    const mediaElements = episodes.map((e) => {
      const mediaElement = episodeToMediaElement(e, {
        local: true,
      } );

      // TODO: quitar de db "series" del path y ponerlo aquí
      mediaElement.path = `${mediaElement.path}`;

      return mediaElementFixPlayerLabels(mediaElement);
    } );

    assertIsNotEmptyClient(mediaElements);
    await this.playService.play( {
      mediaElements,
      force,
      remotePlayerId,
    } );

    const isLast = await this.historyRepo.isLast(episodes[0].compKey);
    const episodesToAddInHistory: EpisodeEntity[] = isLast
      ? episodes.slice(1)
      : episodes;

    await this.historyRepo.addEpisodesToHistory( {
      episodes: episodesToAddInHistory,
      streamId,
    } );

    return episodes;
  }

  async playEpisodeStream(
    remotePlayerId: string,
    streamId: string,
    query: QueryDto,
  ) {
    const { force } = query;
    const stream = await this.streamsRepo.getOneByKey(streamId);

    assertFoundClient(stream);

    let number: number;

    if (query.n === undefined || query.n < 1)
      number = 1;
    else
      number = query.n;

    const episodes = (await this.episodePickerService.getByStream(stream, number ?? 1, {
      expand: ["series", "fileInfos"],
    } ))
      .filter(Boolean) as EpisodeEntityWithFileInfos[];

    assertFoundClient(episodes[0]);

    return this.processAndPlayEpisodes(remotePlayerId, episodes, stream.id, force);
  }

  async playEpisode(
    remotePlayerId: string,
    episodeCompKey: EpisodeCompKey,
    query: QueryDto,
  ) {
    const { force } = query;
    const { episodeKey, seriesKey } = episodeCompKey;
    const serie = await this.seriesRepo.getOneByKey(seriesKey);

    assertFoundClient(serie);

    const episodes = [await this.episodesRepo
      .getOneByCompKey( {
        seriesKey,
        episodeKey,
      }, {
        expand: ["series", "fileInfos"],
      } )]
      .filter(Boolean) as EpisodeEntityWithFileInfos[];

    assertFoundClient(episodes[0]);
    const stream = await this.streamsRepo.getOneOrCreateBySeriesKey(seriesKey);

    return this.processAndPlayEpisodes(remotePlayerId, episodes, stream.id, force);
  }
}
