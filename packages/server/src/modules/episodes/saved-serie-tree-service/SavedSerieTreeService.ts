import { SerieRepository } from "#modules/series";
import { SerieFolderTree } from "../file-info";
import { SerieTree } from "../file-info/tree/models";
import { Model as Episode } from "../models";
import { Repository as EpisodeRepository } from "../repositories";
import { putModelInSerieFolderTree } from "./adapters";

type Params = {
  episodeRepository: EpisodeRepository;
  serieRepository: SerieRepository;
};
export default class Service {
  #episodeRepository: EpisodeRepository;

  #serieRepository: SerieRepository;

  constructor( {episodeRepository, serieRepository}: Params) {
    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;
  }

  async getSavedSeriesTree(): Promise<SerieTree> {
    const serieFolderTree: SerieFolderTree = {
      children: [],
    };
    const series = await this.#serieRepository.getAll();
    const episodesOfSeriePromises = series.map(async serie => {
      const serieEpisodes = await this.#episodeRepository.getAllBySerieId(serie.id);

      return serieEpisodes;
    } );
    const episodesOfSerie: Episode[] = (await Promise.all(episodesOfSeriePromises)).flat().flat();

    for (const episode of episodesOfSerie)
      putModelInSerieFolderTree(episode, serieFolderTree);

    return serieFolderTree;
  }
}