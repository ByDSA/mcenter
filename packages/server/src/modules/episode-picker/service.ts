import { Injectable } from "@nestjs/common";
import { neverCase } from "$shared/utils/validation";
import { buildEpisodePicker } from "./EpisodePicker";
import { EpisodeEntity } from "#episodes/models";
import { EpisodesRepository } from "#episodes/repositories";
import { PickMode, ResourcePicker } from "#modules/picker";
import { Stream, StreamId, StreamMode } from "#modules/streams";
import { StreamsRepository } from "#modules/streams/repositories";
import { assertFound } from "#utils/validation/found";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/repositories";

@Injectable()
export class EpisodePickerService {
  constructor(
    private readonly streamRepository: StreamsRepository,
    private readonly episodeRepository: EpisodesRepository,
    private readonly historyEntriesRepository: EpisodeHistoryEntriesRepository,
  ) {
  }

  async getByStreamId(streamId: StreamId, n = 1): Promise<EpisodeEntity[]> {
    const stream = await this.streamRepository.getOneByKey(streamId);

    if (!stream)
      return [];

    const nextEpisodes: EpisodeEntity[] = await this.getByStream(
      stream,
      n,
    );

    return nextEpisodes;
  }

  async getByStream(stream: Stream, n = 1): Promise<EpisodeEntity[]> {
    const serieKey: string = stream.group.origins[0].id;
    const criteria: Parameters<typeof this.episodeRepository
      .getManyBySerieKey>[1] = {};

    if (stream.mode === StreamMode.SEQUENTIAL) {
      criteria.sort = {
        episodeCompKey: "desc",
      };
    }

    const allEpisodesInSerie = await this.episodeRepository
      .getManyBySerieKey(serieKey, criteria);
    const lastEntry = await this.historyEntriesRepository.findLastForSerieKey(serieKey);

    // eslint-disable-next-line daproj/max-len
    // TODO: debería añadirse "stream" al historial de episodes, y obtener aquí la última entrada de ese stream. Ej: para un stream secuencial no debería interferir los capítulos de la misma serie con otro stream.
    assertFound(lastEntry, `Cannot get last history entry list from stream '${stream.id}'`);
    const lastPlayedEpInSerieCompKey = lastEntry.episodeCompKey;
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
