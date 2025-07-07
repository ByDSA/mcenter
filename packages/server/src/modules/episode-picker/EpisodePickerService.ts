import { assertFound } from "#shared/utils/http/validation";
import { neverCase } from "#shared/utils/validation";
import { Injectable } from "@nestjs/common";
import { Episode } from "#episodes/models";
import { EpisodeRepository, EpisodeRepositoryGetManyOptions } from "#episodes/repositories";
import { HistoryListRepository } from "#modules/historyLists";
import { PickMode, ResourcePicker } from "#modules/picker";
import { Stream, StreamId, StreamMode } from "#modules/streams";
import { StreamRepository } from "#modules/streams/repositories";
import { buildEpisodePicker } from "./EpisodePicker";

@Injectable()
export class EpisodePickerService {
  constructor(
    private streamRepository: StreamRepository,
    private episodeRepository: EpisodeRepository,
    private historyListRepository: HistoryListRepository,
  ) {
  }

  async getByStreamId(streamId: StreamId, n = 1): Promise<Episode[]> {
    const stream = await this.streamRepository.getOneById(streamId);

    if (!stream)
      return [];

    const nextEpisodes: Episode[] = await this.getByStream(
      stream,
      n,
    );

    return nextEpisodes;
  }

  async getByStream(stream: Stream, n = 1): Promise<Episode[]> {
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
    const picker: ResourcePicker<Episode> = buildEpisodePicker( {
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
