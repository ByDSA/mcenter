import type { ResourcePicker } from "#modules/picker";
import type { EpisodeEntity } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { assertIsDefined, neverCase } from "$shared/utils/validation";
import { EpisodesRepository } from "#episodes/crud/repository";
import { PickMode } from "#modules/picker/resource-picker/pick-mode";
import { getSeriesKeyFromStream, StreamEntity, StreamMode } from "#modules/streams";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/crud/repository";
import { buildEpisodePicker } from "./episode-picker";
import { DependenciesList, dependenciesToList } from "./appliers/dependencies";

@Injectable()
export class EpisodePickerService {
  constructor(
    private readonly streamsRepo: StreamsRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
    private readonly dependenciesRepo: EpisodeDependenciesRepository,
  ) {
  }

  async getByStreamKey(streamKey: StreamEntity["key"], n = 1): Promise<EpisodeEntity[]> {
    const stream = await this.streamsRepo.getOneByKey(streamKey);

    if (!stream)
      return [];

    const nextEpisodes: EpisodeEntity[] = await this.getByStream(
      stream,
      n,
    );

    return nextEpisodes;
  }

  async getByStream(stream: StreamEntity, n = 1): Promise<EpisodeEntity[]> {
    const seriesKey = getSeriesKeyFromStream(stream);

    assertIsDefined(seriesKey);
    const criteria: Parameters<typeof this.episodesRepo
      .getManyBySerieKey>[1] = {};

    if (stream.mode === StreamMode.SEQUENTIAL) {
      criteria.sort = {
        episodeCompKey: "asc",
      };
    }

    const allEpisodesInSerie = await this.episodesRepo
      .getManyBySerieKey(seriesKey, criteria);
    const lastEntry = await this.historyRepo.findLast( {
      seriesKey,
      streamId: stream.id,
    } );
    const lastPlayedEpInSerieCompKey = lastEntry?.resourceId;
    const lastPlayedEpInSerie = lastPlayedEpInSerieCompKey
      ? await this.episodesRepo.getOneByCompKey(lastPlayedEpInSerieCompKey)
      : null;
    const mode = streamModeToPickerMode(stream.mode);
    let dependencies: DependenciesList | undefined;

    if (mode === PickMode.RANDOM)
      dependencies = dependenciesToList(await this.dependenciesRepo.getAll());

    const picker: ResourcePicker<EpisodeEntity> = buildEpisodePicker( {
      mode,
      episodes: allEpisodesInSerie,
      lastEp: lastPlayedEpInSerie ?? undefined,
      dependencies,
    } );
    const episodes = await picker.pick(n);

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
