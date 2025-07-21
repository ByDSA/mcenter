import type { EpisodeEntity } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { SerieFolderTree as SerieTree } from "#episodes/file-info";
import { EpisodesRepository } from "#episodes/repositories";
import { putModelInSerieFolderTree } from "./adapters";

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
      .getManyCriteria( {
        expand: ["fileInfos"],
      } ) as EpisodeEntityWithFileInfo[];

    for (const episodeWithFileInfo of allEpisodesWithFileInfo)
      putModelInSerieFolderTree(episodeWithFileInfo, serieFolderTree);

    return serieFolderTree;
  }
}
