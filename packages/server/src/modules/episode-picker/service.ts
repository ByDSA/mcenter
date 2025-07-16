import { Injectable } from "@nestjs/common";
import { neverCase } from "$shared/utils/validation";
import { EpisodeEntity } from "#episodes/models";
import { EpisodesRepository, EpisodesRepositoryGetManyOptions } from "#episodes/repositories";
import { PickMode, ResourcePicker } from "#modules/picker";
import { Stream, StreamId, StreamMode } from "#modules/streams";
import { StreamsRepository } from "#modules/streams/repositories";
import { assertFound } from "#utils/validation/found";
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

  async getByStreamId(streamId: StreamId, n = 1): Promise<EpisodeEntity[]> {
    const stream = await this.streamRepository.getOneById(streamId);

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
    const options: EpisodesRepositoryGetManyOptions = {
      sortById: stream.mode === StreamMode.SEQUENTIAL,
    };
    const allEpisodesInSerie = await this.episodeRepository
      .getManyBySerieKey(serieKey, options);
    const lastEntry = await this.historyEntriesRepository.findLastForSerieKey(serieKey);

    // eslint-disable-next-line max-len
    // TODO: debería añadirse "stream" al historial de episodes, y obtener aquí la última entrada de ese stream. Ej: para un stream secuencial no debería interferir los capítulos de la misma serie con otro stream.
    assertFound(lastEntry, `Cannot get last history entry list from stream '${stream.id}'`);
    const lastPlayedEpInSerieId = lastEntry.episodeId;
    const lastPlayedEpInSerie = lastPlayedEpInSerieId
      ? await this.episodeRepository.getOneById(lastPlayedEpInSerieId)
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
