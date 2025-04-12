import { SerieFolderTree as SerieTree } from "#modules/file-info";
import { SerieRepository } from "#modules/series";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Episode } from "../models";
import { EpisodeRepository } from "../repositories";
import { putModelInSerieFolderTree } from "./adapters";

const DEPS_MAP = {
  episodeRepository: EpisodeRepository,
  serieRepository: SerieRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class SavedSerieTreeService {
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
