import type { ResourcePicker } from "#modules/picker";
import type { EpisodeEntity, EpisodeEntityWithUserInfo } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { assertIsDefined, assertIsNotEmpty, neverCase } from "$shared/utils/validation";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { PickMode } from "#modules/picker/resource-picker/pick-mode";
import { getSeriesKeyFromStream, StreamEntity, StreamMode } from "#modules/streams";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/crud/repository";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { SeriesRepository } from "#modules/series/crud/repository";
import { EpisodeFileInfosRepository } from "#episodes/file-info/crud/repository/repository";
import { buildEpisodePicker } from "./episode-picker";
import { DependenciesList, dependenciesToList } from "./appliers/dependencies";

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
        criteria: {
          expand: ["series", "fileInfos"],
        },
      },
    );

    return nextEpisodes;
  }

  async getByStream(
    stream: StreamEntity,
    n = 1,
    props?: Parameters<typeof this.episodesRepo
      .getManyBySerieKey>[1],
  ): Promise<EpisodeEntity[]> {
    const seriesKey = getSeriesKeyFromStream(stream);

    assertIsDefined(seriesKey);
    props ??= {
      criteria: {},
    };

    if (stream.mode === StreamMode.SEQUENTIAL) {
      props.criteria.sort = {
        episodeCompKey: "asc",
      };
    }

    const allEpisodesInSerie: EpisodeEntityWithUserInfo[] = await this.episodesUsersRepo
      .getFullSerieForUser( {
        userId: stream.userId,
        seriesKey,
      }, props);
    const lastEntry = await this.historyRepo.findLast( {
      streamId: stream.id,
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
      dependencies = dependenciesToList(await this.dependenciesRepo.getAll());

    const picker: ResourcePicker<EpisodeEntityWithUserInfo> = buildEpisodePicker( {
      mode,
      episodes: allEpisodesInSerie,
      lastEp: lastPlayedEpInSerie ?? undefined,
      dependencies,
    } );
    const episodes = await picker.pick(n);

    if (props.criteria.expand) {
      for (const e of episodes) {
        if (props.criteria.expand.includes("series")) {
          const gotSerie = await this.seriesRepo.getOneByKey(e.compKey.seriesKey);

          assertIsDefined(gotSerie);

          e.serie = gotSerie;
        }

        if (props.criteria.expand.includes("fileInfos")) {
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
