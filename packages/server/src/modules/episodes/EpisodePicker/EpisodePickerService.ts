import { HistoryListRepository } from "#modules/historyLists";
import { PickMode, ResourcePicker } from "#modules/picker";
import { Stream, StreamId, StreamMode, StreamRepository } from "#modules/streams";
import { assertFound } from "#shared/utils/http/validation";
import { neverCase } from "#shared/utils/validation";
import { Episode } from "..";
import { Repository } from "../repositories";
import { GetManyOptions } from "../repositories/Repository";
import buildEpisodePicker from "./EpisodePicker";

type Params = {
  streamRepository: StreamRepository;
  episodeRepository: Repository;
  historyListRepository: HistoryListRepository;
};
export default class EpisodePickerService {
  #streamRepository: StreamRepository;

  #episodeRepository: Repository;

  #historyListRepository: HistoryListRepository;

  constructor( {streamRepository,episodeRepository, historyListRepository}: Params) {
    this.#streamRepository = streamRepository;
    this.#episodeRepository = episodeRepository;
    this.#historyListRepository = historyListRepository;
  }

  async getByStreamId(streamId: StreamId, n = 1): Promise<Episode[]> {
    const stream = await this.#streamRepository.getOneById(streamId);

    if (!stream)
      return [];

    const nextEpisodes: Episode[] = await this.getByStream(
      stream,
      n,
    );

    return nextEpisodes;
  }

  async getByStream(stream: Stream, n = 1): Promise<Episode[]> {
    console.log(`Calculating next ${n} episodes ...`);

    const historyList = await this.#historyListRepository.getOneByIdOrCreate(stream.id);

    assertFound(historyList, `Cannot get history list from stream '${stream.id}'`);

    const serieId: string = stream.group.origins[0].id;
    const options: GetManyOptions = {
      sortById: stream.mode === StreamMode.SEQUENTIAL,
    };
    const allEpisodesInSerie = await this.#episodeRepository.getManyBySerieId(serieId, options);
    const lastPlayedEpInSerie = await this.#episodeRepository.findLastEpisodeInHistoryList(historyList);
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