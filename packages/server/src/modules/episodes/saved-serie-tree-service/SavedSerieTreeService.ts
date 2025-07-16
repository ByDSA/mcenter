import { Injectable } from "@nestjs/common";
import { SerieRepository } from "#modules/series/repositories";
import { SerieFolderTree as SerieTree } from "#episodes/file-info";
import { EpisodeEntity } from "../models";
import { EpisodesRepository } from "../repositories";
import { putModelInSerieFolderTree } from "./adapters";

@Injectable()
export class SavedSerieTreeService {
  constructor(
    private readonly episodeRepository: EpisodesRepository,
    private readonly serieRepository: SerieRepository,
  ) {
  }

  async getSavedSeriesTree(): Promise<SerieTree> {
    const serieFolderTree: SerieTree = {
      children: [],
    };
    const series = await this.serieRepository.getAll();
    const episodesOfSeriePromises = series.map(async serie => {
      const serieEpisodes = await this.episodeRepository.getAllBySerieId(serie.id);

      return serieEpisodes;
    } );
    const episodesOfSerie: EpisodeEntity[] = (
      await Promise.all(episodesOfSeriePromises)
    ).flat().flat();

    for (const episode of episodesOfSerie)
      putModelInSerieFolderTree(episode, serieFolderTree);

    return serieFolderTree;
  }
}
