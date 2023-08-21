import HistoryList from "#modules/history/model/HistoryList";
import { SerieRepository, SerieWithEpisodes } from "#modules/series/serie";
import { CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { SerieModel } from "../../../serie/model/repository/serie.model";
import { Episode, EpisodeId, compareEpisodeId } from "../Episode";
import { episodeToEpisodeDB } from "./adapters";

type UpdateOneParams = Episode;

type Params = {
  serieRepository: SerieRepository;
};
export default class EpisodeRepository
implements CanGetOneById<Episode, EpisodeId>,
CanUpdateOneByIdAndGet<Episode, EpisodeId>
{
  #serieRepository: SerieRepository;

  constructor( {serieRepository}: Params) {
    this.#serieRepository = serieRepository;
  }

  async findLastEpisodeInHistoryList(historyList: HistoryList): Promise<Episode | null> {
    const episodeId = historyList.entries.at(-1)?.episodeId;

    if (!episodeId)
      return null;

    return this.getOneById(episodeId);
  }

  async #findSerieOfEpisodeId(episodeId: EpisodeId): Promise<SerieWithEpisodes | null> {
    const serie = await this.#serieRepository.getOneById(episodeId.serieId);

    if (!serie)
      return null;

    return serie;
  }

  async getOneById(id: EpisodeId): Promise<Episode | null> {
    const episodeId = id;
    const serie = await this.#findSerieOfEpisodeId(episodeId);

    if (!serie)
      return null;

    const found = serie.episodes.find((episode: Episode) => compareEpisodeId(episode.id, episodeId)) ?? null;

    return found;
  }

  async updateOneByIdAndGet(id: EpisodeId, episode: UpdateOneParams): Promise<Episode | null> {
    const serie = await this.#serieRepository.getOneById(episode.id.serieId);

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