import { Injectable } from "@nestjs/common";
import { neverCase } from "$shared/utils/validation";
import { EpisodeEntity } from "#episodes/models";
import { EpisodeRepository, EpisodeRepositoryGetManyOptions } from "#episodes/repositories";
import { PickMode, ResourcePicker } from "#modules/picker";
import { Stream, StreamId, StreamMode } from "#modules/streams";
import { StreamsRepository } from "#modules/streams/repositories";
import { EpisodeHistoryListRepository } from "#episodes/history";
import { assertFound } from "#utils/validation/found";
import { buildEpisodePicker } from "./EpisodePicker";

@Injectable()
export class EpisodePickerService {
  constructor(
    private streamRepository: StreamsRepository,
    private episodeRepository: EpisodeRepository,
    private historyListRepository: EpisodeHistoryListRepository,
  ) {
  }

  static providers = Object.freeze([
    StreamsRepository,
    ...StreamsRepository.providers,
    EpisodeRepository,
    ...EpisodeRepository.providers,
    EpisodeHistoryListRepository,
    ...EpisodeHistoryListRepository.providers,
  ]);

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
    const serieId: string = stream.group.origins[0].id;
    const options: EpisodeRepositoryGetManyOptions = {
      sortById: stream.mode === StreamMode.SEQUENTIAL,
    };
    const allEpisodesInSerie = await this.episodeRepository
      .getManyBySerieId(serieId, options);
    const historyList = await this.historyListRepository.getOneByIdOrCreate(stream.id);

    assertFound(historyList, `Cannot get history list from stream '${stream.id}'`);
    const lastPlayedEpInSerieId = historyList.entries.at(-1)?.episodeId;
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
