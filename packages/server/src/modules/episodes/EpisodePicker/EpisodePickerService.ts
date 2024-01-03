import { HistoryListRepository } from "#modules/historyLists";
import { PickMode, ResourcePicker } from "#modules/picker";
import { Stream, StreamId, StreamMode, StreamRepository } from "#modules/streams";
import { assertFound } from "#shared/utils/http/validation";
import { neverCase } from "#shared/utils/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Episode } from "..";
import { Repository } from "../repositories";
import { GetManyOptions } from "../repositories/Repository";
import buildEpisodePicker from "./EpisodePicker";

const DepsMap = {
  streamRepository: StreamRepository,
  episodeRepository: Repository,
  historyListRepository: HistoryListRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class EpisodePickerService {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getByStreamId(streamId: StreamId, n = 1): Promise<Episode[]> {
    const stream = await this.#deps.streamRepository.getOneById(streamId);

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

    const serieId: string = stream.group.origins[0].id;
    const options: GetManyOptions = {
      sortById: stream.mode === StreamMode.SEQUENTIAL,
    };
    const allEpisodesInSerie = await this.#deps.episodeRepository.getManyBySerieId(serieId, options);
    const historyList = await this.#deps.historyListRepository.getOneByIdOrCreate(stream.id);

    assertFound(historyList, `Cannot get history list from stream '${stream.id}'`);
    const lastPlayedEpInSerieId = historyList.entries.at(-1)?.episodeId;
    const lastPlayedEpInSerie = lastPlayedEpInSerieId ? await this.#deps.episodeRepository.getOneById(lastPlayedEpInSerieId) : null;
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