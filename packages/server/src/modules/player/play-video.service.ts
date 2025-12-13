import type { QueryDto } from "./play-stream/controller";
import { Injectable } from "@nestjs/common";
import { EpisodeCompKey, EpisodeEntityWithFileInfos } from "$shared/models/episodes";
import { episodeToMediaElement } from "$shared/models/player";
import { mediaElementFixPlayerLabels } from "$shared/models/resources";
import { assertFoundClient, assertIsNotEmptyClient } from "#utils/validation/found";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { EpisodePickerService } from "#modules/streams/picker";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { EpisodeEntity } from "#episodes/models";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { SeriesRepository } from "#modules/series/crud/repository";
import { PlayService } from "./play.service";
import { RemotePlayersRepository } from "./player-services/repository";

type ProcessAndPlayEpisodesProps = {
  remotePlayerId: string;
  episodes: EpisodeEntityWithFileInfos[];
  streamId: string;
  force?: boolean;
};
type PlayEpisodeProps = {
  remotePlayerId: string;
  episodeCompKey: EpisodeCompKey;
  query: QueryDto;
};
type PlayEpisodeStreamProps = {
  userId: string;
  remotePlayerId: string;
  streamId: string;
  query: QueryDto;
};
@Injectable()
export class PlayVideoService {
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

    const userIds = await this.remotePlayersRepo.getAllViewersOf(remotePlayerId);

    for (const userId of userIds) {
      const isLast = await this.historyRepo.isLast(episodes[0].id, userId);
      const episodesToAddInHistory: EpisodeEntity[] = isLast
        ? episodes.slice(1)
        : episodes;

      await this.historyRepo.addEpisodesToHistory( {
        episodes: episodesToAddInHistory,
        streamId,
        userId,
      } );
    }

    return episodes;
  }

  async playEpisodeStream( { query, remotePlayerId, streamId, userId }: PlayEpisodeStreamProps) {
    const { force } = query;
    const stream = await this.streamsRepo.getOneByKey(userId, streamId);

    assertFoundClient(stream);

    let number: number;

    if (query.n === undefined || query.n < 1)
      number = 1;
    else
      number = query.n;

    const episodes = (await this.episodePickerService.getByStream(stream, number ?? 1, {
      requestingUserId: userId,
      criteria: {
        expand: ["series", "fileInfos"],
      },
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

  async playEpisode( { episodeCompKey, query, remotePlayerId }: PlayEpisodeProps) {
    const { force } = query;
    const { episodeKey, seriesKey } = episodeCompKey;
    const serie = await this.seriesRepo.getOneByKey(seriesKey);

    assertFoundClient(serie);
    const remotePlayer = await this.remotePlayersRepo.getOneById(remotePlayerId);

    assertFoundClient(remotePlayer);
    const requestingUserId = remotePlayer.ownerId.toString();
    const episodes = [await this.episodesRepo
      .getOneByCompKey( {
        seriesKey,
        episodeKey,
      }, {
        criteria: {
          expand: ["series", "fileInfos"],
        },
        requestingUserId,
      } )]
      .filter(Boolean) as EpisodeEntityWithFileInfos[];

    assertFoundClient(episodes[0]);
    const stream = await this.streamsRepo.getOneOrCreateBySeriesKey(
      requestingUserId,
      seriesKey,
    );

    return this.processAndPlayEpisodes( {
      remotePlayerId,
      episodes,
      streamId: stream.id,
      force,
    } );
  }
}
