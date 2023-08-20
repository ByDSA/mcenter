/* eslint-disable class-methods-use-this */
import { SerieId, SerieRepository, SerieWithEpisodes } from "#modules/series/serie";
import { SerieModel } from "#modules/series/serie/model/repository/serie.model";
import { Stream } from "#modules/stream";
import { Repository } from "#modules/utils/base/repository";
import { Episode, EpisodeId } from "../episode.entity";

type FindOneParamsSerie = {
  episodeId: EpisodeId;
  serie: SerieWithEpisodes;
};

type FindOneParamsSerieId = {
  episodeId: EpisodeId;
  serieId: SerieId;
};

type UpdateOneParams = {
  episode: Episode;
  serieId: SerieId;
};

type FindOneParams = FindOneParamsSerie | FindOneParamsSerieId;

export default class EpisodeRepository extends Repository {
  async findLastEpisodeInStream(stream: Stream): Promise<Episode | null> {
    const episodeId = stream.history.at(-1)?.episodeId;

    if (!episodeId)
      return null;

    const serie = await SerieRepository.getInstance<SerieRepository>().findOneFromGroupId(stream.group);

    if (!serie)
      return null;

    return this.findEpisodeInSerie(episodeId, serie);
  }

  private findEpisodeInSerie(episodeId: EpisodeId, serie: SerieWithEpisodes): Episode | null {
    return serie.episodes.find((episode: Episode) => episode.id === episodeId) ?? null;
  }

  async findOneById(params: FindOneParams): Promise<Episode | null> {
    const {episodeId} = params;
    const {serieId} = params as FindOneParamsSerieId;
    let {serie} = params as FindOneParamsSerie;

    if (!serie) {
      const gotSerie = await SerieRepository.getInstance<SerieRepository>().findOneById(serieId);

      if (!gotSerie)
        return null;

      serie = gotSerie;
    }

    return this.findEpisodeInSerie(episodeId, serie);
  }

  async updateOne(params: UpdateOneParams): Promise<Episode | null> {
    const serie = await SerieRepository.getInstance<SerieRepository>().findOneById(params.serieId);

    if (!serie)
      return null;

    const index = serie.episodes.findIndex((e) => e.id === params.episode.id);

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