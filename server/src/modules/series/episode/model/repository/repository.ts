/* eslint-disable class-methods-use-this */
import { SerieId, SerieRepository, SerieWithEpisodes } from "#modules/series/serie";
import { Stream } from "#modules/stream";
import { Repository } from "#modules/utils/base/repository";
import { SerieModel } from "../../../serie/model/repository/serie.model";
import { Episode, EpisodeInnerId } from "../episode.entity";

type FindOneParamsSerie = {
  episodeId: EpisodeInnerId;
  serie: SerieWithEpisodes;
};

type FindOneParamsSerieId = {
  episodeId: EpisodeInnerId;
  serieId: SerieId;
};

type UpdateOneParams = {
  episode: Episode;
  serieId: SerieId;
};

type FindOneParams = FindOneParamsSerie | FindOneParamsSerieId;

type Params = {
  serieRepository: SerieRepository;
};
export default class EpisodeRepository implements Repository {
  #serieRepository: SerieRepository;

  constructor( {serieRepository}: Params) {
    this.#serieRepository = serieRepository;
  }

  async findLastEpisodeInStream(stream: Stream): Promise<Episode | null> {
    const episodeId = stream.history.at(-1)?.episodeId;

    if (!episodeId)
      return null;

    const serie = await this.#serieRepository.findOneFromGroupId(stream.group);

    if (!serie)
      return null;

    return this.#findEpisodeInSerie(episodeId, serie);
  }

  #findEpisodeInSerie(episodeId: EpisodeInnerId, serie: SerieWithEpisodes): Episode | null {
    return serie.episodes.find((episode: Episode) => episode.innerId === episodeId) ?? null;
  }

  async findOneById(params: FindOneParams): Promise<Episode | null> {
    const {episodeId} = params;
    const {serieId} = params as FindOneParamsSerieId;
    let {serie} = params as FindOneParamsSerie;

    if (!serie) {
      const gotSerie = await this.#serieRepository.findOneById(serieId);

      if (!gotSerie)
        return null;

      serie = gotSerie;
    }

    return this.#findEpisodeInSerie(episodeId, serie);
  }

  async updateOne(params: UpdateOneParams): Promise<Episode | null> {
    const serie = await this.#serieRepository.findOneById(params.serieId);

    if (!serie)
      return null;

    const index = serie.episodes.findIndex((e) => e.innerId === params.episode.innerId);

    if (index === -1)
      return null;

    await SerieModel.updateOne( {
      id: serie.id,
    }, {
      $set: {
        [`episodes.${index}`]: params.episode,
      },
    } );

    return params.episode;
  }
}