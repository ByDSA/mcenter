import type { EpisodeEntity } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { putModelInSerieFolderTree } from "./adapters";
import { SerieFolderTree as SerieTree } from "#episodes/file-info";
import { EpisodesRepository } from "#episodes/repositories";

export type EpisodeEntityWithFileInfo = EpisodeEntity & Required<Pick<EpisodeEntity, "fileInfos">>;

@Injectable()
export class SavedSerieTreeService {
  constructor(
    private readonly episodesRepo: EpisodesRepository,
  ) {
  }

  async getSavedSeriesTree(): Promise<SerieTree> {
    const serieFolderTree: SerieTree = {
      children: [],
    };
    const allEpisodesWithFileInfo: EpisodeEntityWithFileInfo[] = await this.episodesRepo
      .getManyByCriteria( {
        expand: ["fileInfos"],
      } ) as EpisodeEntityWithFileInfo[];

    for (const episodeWithFileInfo of allEpisodesWithFileInfo)
      putModelInSerieFolderTree(episodeWithFileInfo, serieFolderTree);

    return serieFolderTree;
  }
}
