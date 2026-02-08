import type { ResourcePicker } from "#modules/picker";
import type { EpisodeEntity, EpisodeEntityWithUserInfo } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { assertIsDefined, assertIsNotEmpty, neverCase } from "$shared/utils/validation";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { PickMode } from "#modules/picker/resource-picker/pick-mode";
import { getSeriesKeyFromStream, StreamEntity, StreamMode } from "#episodes/streams";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/crud/repository";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { SeriesRepository } from "#episodes/series/crud/repository";
import { EpisodeFileInfosRepository } from "#episodes/file-info/crud/repository/repository";
import { assertFoundServer } from "#utils/validation/found";
import { buildEpisodePicker } from "./episode-picker";
import { DependenciesList } from "./appliers/dependencies";

@Injectable()
export class StreamGetRandomEpisodeService {
  constructor(
    private readonly streamsRepo: StreamsRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly episodesUsersRepo: EpisodesUsersRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
    private readonly dependenciesRepo: EpisodeDependenciesRepository,
    private readonly seriesRepo: SeriesRepository,
    private readonly fileInfosRepo: EpisodeFileInfosRepository,
  ) {
  }

  async getByStreamKey(
    userId: string,
    streamKey: StreamEntity["key"],
    n = 1,
  ): Promise<EpisodeEntity[]> {
    const stream = await this.streamsRepo.getOneByKey(userId, streamKey);

    if (!stream)
      return [];

    const nextEpisodes: EpisodeEntity[] = await this.getByStream(
      stream,
      n,
      {
        expand: ["series", "fileInfos"],
      },
    );

    return nextEpisodes;
  }

  async getByStream(
    stream: StreamEntity,
    n = 1,
    criteria?: Parameters<typeof this.episodesRepo
      .getManyBySerieKey>[1],
  ): Promise<EpisodeEntity[]> {
    const seriesKey = getSeriesKeyFromStream(stream);

    assertIsDefined(seriesKey);

    criteria ??= {};

    if (stream.mode === StreamMode.SEQUENTIAL) {
      criteria.sort = {
        episodeCompKey: "asc",
      };
    }

    const series = await this.seriesRepo.getOneByKey(seriesKey);

    assertFoundServer(series);
    const allEpisodesInSerie: EpisodeEntityWithUserInfo[] = await this.episodesUsersRepo
      .getFullSerieForUser(series.id, {
        requestingUserId: stream.userId,
      }, criteria);
    const lastEntry = await this.historyRepo.findLast( {
      streamId: stream.id,
    }, {
      requestingUserId: stream.userId,
    } );
    const lastPlayedEpInSerieId = lastEntry?.resourceId;
    const lastPlayedEpInSerie: EpisodeEntityWithUserInfo | null = lastPlayedEpInSerieId
      ? await this.episodesRepo.getOneById(
        lastPlayedEpInSerieId,
      ) as EpisodeEntityWithUserInfo | null
      : null;
    const mode = streamModeToPickerMode(stream.mode);
    let dependencies: DependenciesList | undefined;

    if (mode === PickMode.RANDOM)
      dependencies = await this.dependenciesRepo.getAll();

    const picker: ResourcePicker<EpisodeEntityWithUserInfo> = buildEpisodePicker( {
      mode,
      episodes: allEpisodesInSerie,
      lastEp: lastPlayedEpInSerie ?? undefined,
      dependencies,
    } );
    const episodes = await picker.pick(n);

    if (criteria.expand) {
      for (const e of episodes) {
        if (criteria.expand.includes("series")) {
          const gotSeries = await this.seriesRepo.getOneById(e.seriesId);

          assertIsDefined(gotSeries);

          e.series = gotSeries;
        }

        if (criteria.expand.includes("fileInfos")) {
          const gotFileInfos = await this.fileInfosRepo.getAllByEpisodeId(e.id);

          assertIsNotEmpty(gotFileInfos);

          e.fileInfos = gotFileInfos;
        }
      }
    }

    return episodes;
  }
}

function streamModeToPickerMode(mode: StreamMode): PickMode {
  switch (mode) {
    case StreamMode.SEQUENTIAL:
      return PickMode.SEQUENTIAL;
    case StreamMode.RANDOM:
      return PickMode.RANDOM;
    default:
      return neverCase(mode);
  }
}
