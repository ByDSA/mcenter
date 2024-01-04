import { SerieFolderTree as SerieTree } from "#modules/file-info";
import { SerieRepository } from "#modules/series";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Model as Episode } from "../models";
import { Repository as EpisodeRepository } from "../repositories";
import { putModelInSerieFolderTree } from "./adapters";

const DepsMap = {
  episodeRepository: EpisodeRepository,
  serieRepository: SerieRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class Service {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getSavedSeriesTree(): Promise<SerieTree> {
    const serieFolderTree: SerieTree = {
      children: [],
    };
    const series = await this.#deps.serieRepository.getAll();
    const episodesOfSeriePromises = series.map(async serie => {
      const serieEpisodes = await this.#deps.episodeRepository.getAllBySerieId(serie.id);

      return serieEpisodes;
    } );
    const episodesOfSerie: Episode[] = (await Promise.all(episodesOfSeriePromises)).flat().flat();

    for (const episode of episodesOfSerie)
      putModelInSerieFolderTree(episode, serieFolderTree);

    return serieFolderTree;
  }
}