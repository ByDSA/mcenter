/* eslint-disable class-methods-use-this */
import { Serie, SerieId, SerieRepository } from "#modules/series/serie";
import { Stream } from "#modules/stream";
import { Repository } from "#modules/utils/base/repository";
import Episode, { EpisodeId } from "../episode.entity";

type FindOneParamsSerie = {
  episodeId: EpisodeId;
  serie: Serie;
};

type FindOneParamsSerieId = {
  episodeId: EpisodeId;
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

  private findEpisodeInSerie(episodeId: EpisodeId, serie: Serie): Episode | null {
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
}