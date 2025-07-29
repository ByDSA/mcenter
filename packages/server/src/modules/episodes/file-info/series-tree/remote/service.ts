import type { EpisodeEntity } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { treePut } from "$shared/utils/trees";
import { SerieFolderTree as SerieTree } from "#episodes/file-info";
import { EpisodesRepository } from "#episodes/repositories";
import { EpisodeFile, SerieFolderTree } from "#episodes/file-info";
import { episodeToEpisodeFiles } from "./adapters";

export type EpisodeEntityWithFileInfos = EpisodeEntity & Required<Pick<EpisodeEntity, "fileInfos">>;

@Injectable()
export class RemoteSeriesTreeService {
  constructor(
    private readonly episodesRepo: EpisodesRepository,
  ) {
  }

  async getRemoteSeriesTree(): Promise<SerieTree> {
    const serieFolderTree: SerieTree = {
      children: [],
    };
    const allEpisodesWithFileInfos: EpisodeEntityWithFileInfos[] = await this.episodesRepo
      .getManyByCriteria( {
        expand: ["fileInfos"],
      } ) as EpisodeEntityWithFileInfos[];

    for (const episodeWithFileInfos of allEpisodesWithFileInfos)
      putModelInSerieFolderTree(episodeWithFileInfos, serieFolderTree);

    return serieFolderTree;
  }
}

export function putModelInSerieFolderTree(
  episodeEntity: EpisodeEntityWithFileInfos,
  serieFolderTree: SerieFolderTree,
): SerieFolderTree {
  const { compKey: { seriesKey, episodeKey } } = episodeEntity;
  const seasonId = getSeasonFromCode(episodeKey) ?? "";
  const episodeFiles: EpisodeFile[] = episodeToEpisodeFiles(episodeEntity);

  for (const episodeFile of episodeFiles)
    treePut(serieFolderTree, [seriesKey, seasonId], episodeFile.key, episodeFile.content);

  return serieFolderTree;
}

function getSeasonFromCode(code: string): string | null {
  const match = code.match(/^(\d+)x/);

  if (match)
    return match[1];

  return null;
}
