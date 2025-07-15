import { Injectable } from "@nestjs/common";
import { SerieFolderTree as SerieTree } from "#modules/file-info";
import { SerieRepository } from "#modules/series";
import { EpisodeEntity } from "../models";
import { EpisodesRepository } from "../repositories";
import { putModelInSerieFolderTree } from "./adapters";

@Injectable()
export class SavedSerieTreeService {
  constructor(
    private episodeRepository: EpisodesRepository,
    private serieRepository: SerieRepository,
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
