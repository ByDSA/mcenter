import { Injectable } from "@nestjs/common";
import { neverCase } from "$shared/utils/validation";
import { EpisodeEntity } from "#episodes/models";
import { EpisodesRepository } from "#episodes/repositories";
import { PickMode, ResourcePicker } from "#modules/picker";
import { StreamEntity, StreamMode } from "#modules/streams";
import { StreamsRepository } from "#modules/streams/repositories";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/repositories";
import { buildEpisodePicker } from "./EpisodePicker";

@Injectable()
export class EpisodePickerService {
  constructor(
    private readonly streamRepository: StreamsRepository,
    private readonly episodeRepository: EpisodesRepository,
    private readonly historyEntriesRepository: EpisodeHistoryEntriesRepository,
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
    const seriesKey: string = stream.group.origins[0].id;
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
    const picker: ResourcePicker<EpisodeEntity> = buildEpisodePicker( {
      mode: streamModeToPickerMode(stream.mode),
      episodes: allEpisodesInSerie,
      lastEp: lastPlayedEpInSerie ?? undefined,
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
