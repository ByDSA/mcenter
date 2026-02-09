import type { QueryDto } from "../play-stream/controller";
import { Injectable } from "@nestjs/common";
import { EpisodeEntityWithFileInfos } from "$shared/models/episodes";
import { episodeToMediaElement } from "$shared/models/player";
import { mediaElementFixPlayerLabels } from "$shared/models/resources";
import { assertFoundClient, assertFoundServer, assertIsNotEmptyClient } from "#utils/validation/found";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { EpisodePickerService } from "#episodes/streams/picker";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { EpisodeEntity } from "#episodes/models";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { SeriesRepository } from "#episodes/series/crud/repository";
import { PlayService } from "../play.service";
import { RemotePlayersRepository } from "../player-services/repository";

type ProcessAndPlayEpisodesProps = {
  remotePlayerId: string;
  episodes: EpisodeEntityWithFileInfos[];
  streamId: string;
  force?: boolean;
};
type PlayEpisodeProps = {
  remotePlayerId: string;
  episodeId: string;
  query: QueryDto;
};
type PlayEpisodeStreamProps = {
  userId: string;
  remotePlayerId: string;
  streamKey: string;
  query: QueryDto;
};
@Injectable()
export class PlayEpisodeService {
  constructor(
    private readonly episodePickerService: EpisodePickerService,
    private readonly streamsRepo: StreamsRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
    private readonly seriesRepo: SeriesRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly playService: PlayService,
    private readonly remotePlayersRepo: RemotePlayersRepository,
  ) { }

  private async processAndPlayEpisodes( { episodes,
    remotePlayerId,
    streamId,
    force }: ProcessAndPlayEpisodesProps): Promise<EpisodeEntityWithFileInfos[]> {
    const mediaElements = [];

    for (const e of episodes) {
      const series = await this.seriesRepo.getOneById(e.seriesId);

      assertFoundServer(series);
      const mediaElement = episodeToMediaElement(e, series.name, {
        local: true,
      } );

      mediaElement.path = `series/${mediaElement.path}`;

      mediaElements.push(mediaElementFixPlayerLabels(mediaElement));
    }

    assertIsNotEmptyClient(mediaElements);
    await this.playService.play( {
      mediaElements,
      force,
      remotePlayerId,
    } );

    const userIds = await this.remotePlayersRepo.getAllViewersOf(remotePlayerId);

    for (const userId of userIds) {
      const options = {
        requestingUserId: userId,
      };
      const isLast = await this.historyRepo.isLast(episodes[0].id, options);
      const episodesToAddInHistory: EpisodeEntity[] = isLast
        ? episodes.slice(1)
        : episodes;

      await this.historyRepo.addEpisodesToHistory( {
        episodes: episodesToAddInHistory,
        streamId,
      }, options);
    }

    return episodes;
  }

  async playEpisodeStream(
    { query, remotePlayerId, streamKey: streamId, userId }: PlayEpisodeStreamProps,
  ) {
    const { force } = query;
    const stream = await this.streamsRepo.getOneByKey(userId, streamId);

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

    return this.processAndPlayEpisodes(
      {
        remotePlayerId,
        episodes,
        streamId: stream.id,
        force,
      },
    );
  }

  async playEpisode( { episodeId, query, remotePlayerId }: PlayEpisodeProps) {
    const { force } = query;
    const remotePlayer = await this.remotePlayersRepo.getOneById(remotePlayerId);

    assertFoundClient(remotePlayer);
    const requestingUserId = remotePlayer.ownerId.toString();
    const episodes = [await this.episodesRepo
      .getOneById(episodeId, {
        expand: ["series", "fileInfos"],
      }, {
        requestingUserId,
      } )]
      .filter(Boolean) as EpisodeEntityWithFileInfos[];

    assertFoundClient(episodes[0]);
    assertFoundClient(episodes[0].series);
    assertFoundClient(episodes[0].fileInfos);
    const { series } = episodes[0];

    assertFoundClient(series);
    const stream = await this.streamsRepo.getOneOrCreateBySeriesId(
      requestingUserId,
      series.id,
    );

    return this.processAndPlayEpisodes( {
      remotePlayerId,
      episodes,
      streamId: stream.id,
      force,
    } );
  }
}
