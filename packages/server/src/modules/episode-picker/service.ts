import type { ResourcePicker } from "#modules/picker";
import type { EpisodeEntity } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { assertIsDefined, neverCase } from "$shared/utils/validation";
import { EpisodesRepository } from "#episodes/rest/repository";
import { PickMode } from "#modules/picker/ResourcePicker/PickMode";
import { getSeriesKeyFromStream, StreamEntity, StreamMode } from "#modules/streams";
import { StreamsRepository } from "#modules/streams/rest/repository";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/rest/repository";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/rest/repository";
import { buildEpisodePicker } from "./EpisodePicker";
import { DependenciesList, dependenciesToList } from "./appliers/Dependencies";

@Injectable()
export class EpisodePickerService {
  constructor(
    private readonly streamRepository: StreamsRepository,
    private readonly episodeRepository: EpisodesRepository,
    private readonly historyEntriesRepository: EpisodeHistoryEntriesRepository,
    private readonly dependenciesRepo: EpisodeDependenciesRepository,
  ) {
  }

  async getByStreamKey(streamKey: StreamEntity["key"], n = 1): Promise<EpisodeEntity[]> {
    const stream = await this.streamRepository.getOneByKey(streamKey);

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
    const criteria: Parameters<typeof this.episodeRepository
      .getManyBySerieKey>[1] = {};

    if (stream.mode === StreamMode.SEQUENTIAL) {
      criteria.sort = {
        episodeCompKey: "asc",
      };
    }

    const allEpisodesInSerie = await this.episodeRepository
      .getManyBySerieKey(seriesKey, criteria);
    const lastEntry = await this.historyEntriesRepository.findLast( {
      seriesKey,
      streamId: stream.id,
    } );
    const lastPlayedEpInSerieCompKey = lastEntry?.episodeCompKey;
    const lastPlayedEpInSerie = lastPlayedEpInSerieCompKey
      ? await this.episodeRepository.getOneByCompKey(lastPlayedEpInSerieCompKey)
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
