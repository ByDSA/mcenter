import HistoryList from "#modules/history/model/HistoryList";
import { SerieWithEpisodes, SerieWithEpisodesRepository } from "#modules/series/serie";
import { CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { SerieModel } from "../../../serie/model/repository/serie.model";
import Episode, { EpisodeFullId } from "../Episode";
import { episodeToEpisodeDB } from "./adapters";

type UpdateOneParams = Episode;

type Params = {
  serieRepository: SerieWithEpisodesRepository;
};
export default class EpisodeRepository
implements CanGetOneById<Episode, EpisodeFullId>,
CanUpdateOneByIdAndGet<Episode, EpisodeFullId>
{
  #serieRepository: SerieWithEpisodesRepository;

  constructor( {serieRepository}: Params) {
    this.#serieRepository = serieRepository;
  }

  async findLastEpisodeInHistoryList(historyList: HistoryList): Promise<Episode | null> {
    const historyEntry = historyList.entries.at(-1);

    if (!historyEntry)
      return null;

    const {episodeId, serieId} = historyEntry;

    if (!episodeId || !serieId)
      return null;

    const fullId: EpisodeFullId = {
      episodeId,
      serieId,
    };

    return this.getOneById(fullId);
  }

  async #findSerieOfEpisodeFullId(episodeFullId: EpisodeFullId): Promise<SerieWithEpisodes | null> {
    const serie = await this.#serieRepository.getOneById(episodeFullId.serieId);

    if (!serie)
      return null;

    return serie;
  }

  async getOneById(fullId: EpisodeFullId): Promise<Episode | null> {
    const {episodeId} = fullId;
    const serie = await this.#findSerieOfEpisodeFullId(fullId);

    if (!serie)
      return null;

    const found = serie.episodes.find((episode: Episode) => episode.episodeId === episodeId) ?? null;

    return found;
  }

  async updateOneByIdAndGet(fullId: EpisodeFullId, episode: UpdateOneParams): Promise<Episode | null> {
    const serie = await this.#serieRepository.getOneById(fullId.serieId);

    if (!serie)
      return null;

    const indexOfEpisode = serie.episodes.findIndex((e) => e.episodeId === episode.episodeId);

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