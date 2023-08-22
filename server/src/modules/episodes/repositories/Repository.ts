import { HistoryList } from "#modules/historyLists";
import { CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { SerieWithEpisodes, SerieWithEpisodesRepository } from "#modules/seriesWithEpisodes";
import { ModelODM } from "#modules/seriesWithEpisodes/repositories/serie.model";
import Episode, { EpisodeFullId } from "../models/Episode";
import { episodeToEpisodeDB } from "./adapters";

type UpdateOneParams = Episode;

type Params = {
  serieWithEpisodesRepository: SerieWithEpisodesRepository;
};
export default class Repository
implements CanGetOneById<Episode, EpisodeFullId>,
CanUpdateOneByIdAndGet<Episode, EpisodeFullId>
{
  #serieWithEpisodesRepository: SerieWithEpisodesRepository;

  constructor( {serieWithEpisodesRepository: serieRepository}: Params) {
    this.#serieWithEpisodesRepository = serieRepository;
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
    const serie = await this.#serieWithEpisodesRepository.getOneById(episodeFullId.serieId);

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
    const serie = await this.#serieWithEpisodesRepository.getOneById(fullId.serieId);

    if (!serie)
      return null;

    const indexOfEpisode = serie.episodes.findIndex((e) => e.episodeId === episode.episodeId);

    if (indexOfEpisode === -1)
      return null;

    const episodeDto = episodeToEpisodeDB(episode);

    await ModelODM.updateOne( {
      id: serie.id,
    }, {
      $set: {
        [`episodes.${indexOfEpisode}`]: episodeDto,
      },
    } );

    return episode;
  }
}