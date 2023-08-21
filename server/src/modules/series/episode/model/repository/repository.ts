/* eslint-disable class-methods-use-this */
import HistoryList from "#modules/history/model/HistoryList";
import { SerieRepository, SerieWithEpisodes } from "#modules/series/serie";
import { Repository } from "#modules/utils/base/repository";
import { SerieModel } from "../../../serie/model/repository/serie.model";
import { Episode, EpisodeId, compareEpisodeId } from "../Episode";
import { episodeToEpisodeDB } from "./adapters";

type FindOneParamsSerie = EpisodeId;

type FindOneParamsSerieId = EpisodeId;

type UpdateOneParams = Episode;

type FindOneParams = FindOneParamsSerie | FindOneParamsSerieId;

type Params = {
  serieRepository: SerieRepository;
};
export default class EpisodeRepository implements Repository {
  #serieRepository: SerieRepository;

  constructor( {serieRepository}: Params) {
    this.#serieRepository = serieRepository;
  }

  // eslint-disable-next-line require-await
  async findLastEpisodeInHistoryList(historyList: HistoryList): Promise<Episode | null> {
    const episodeId = historyList.entries.at(-1)?.episodeId;

    if (!episodeId)
      return null;

    return this.findOneById(episodeId);
  }

  async #findSerieOfEpisodeId(episodeId: EpisodeId): Promise<SerieWithEpisodes | null> {
    const serie = await this.#serieRepository.findOneById(episodeId.serieId);

    if (!serie)
      return null;

    return serie;
  }

  async findOneById(params: FindOneParams): Promise<Episode | null> {
    const episodeId = params;
    const serie = await this.#findSerieOfEpisodeId(episodeId);

    if (!serie)
      return null;

    const found = serie.episodes.find((episode: Episode) => compareEpisodeId(episode.id, episodeId)) ?? null;

    return found;
  }

  async updateOneAndGet(episode: UpdateOneParams): Promise<Episode | null> {
    const serie = await this.#serieRepository.findOneById(episode.id.serieId);

    if (!serie)
      return null;

    const indexOfEpisode = serie.episodes.findIndex((e) => compareEpisodeId(e.id, episode.id));

    if (indexOfEpisode === -1)
      return null;

    const episodeDto = episodeToEpisodeDB(episode);

    await SerieModel.updateOne( {
      id: serie.id,
    }, {
      $set: {
        [`episodes.${indexOfEpisode}`]: episodeDto,
      },
    } );

    return episode;
  }
}