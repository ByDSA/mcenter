/* eslint-disable no-await-in-loop */
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { Stream, StreamId, StreamRepository } from "#modules/streams";
import { assertFound } from "#utils/http/validation";
import { Episode } from "..";
import { Repository } from "../repositories";
import EpisodePicker from "./EpisodePicker";
import buildEpisodePicker from "./EpisodePickerBuilder";

type Params = {
  streamRepository: StreamRepository;
  serieRepository: SerieRepository;
  episodeRepository: Repository;
  historyListRepository: HistoryListRepository;
};
export default class EpisodePickerService {
  #streamRepository: StreamRepository;

  #episodeRepository: Repository;

  #serieRepository: SerieRepository;

  #historyListRepository: HistoryListRepository;

  constructor( {streamRepository,episodeRepository, serieRepository, historyListRepository}: Params) {
    this.#streamRepository = streamRepository;
    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;
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
    const serie = await this.#serieRepository.getOneById(serieId);

    assertFound(serie, `Cannot get serie from id '${serieId}'`);
    const allEpisodesInSerie = await this.#episodeRepository.getManyBySerieId(serie.id);
    const lastEp = await this.#episodeRepository.findLastEpisodeInHistoryList(historyList);
    const picker: EpisodePicker = buildEpisodePicker( {
      mode: stream.mode,
      episodes: allEpisodesInSerie,
      serie,
      stream,
      historyList,
      lastEp: lastEp ?? undefined,
    } );
    const episodes = await picker.pick(n);

    return episodes;
  }
}
