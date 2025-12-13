import type { EpisodeEntity } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { treePut } from "$shared/utils/trees";
import { WithRequired } from "$shared/utils/objects";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { EpisodeFile, SerieFolderTree as SerieTree } from "../disk";
import { episodeToEpisodeFiles } from "./adapters";

export type EpisodeEntityWithFileInfos = WithRequired<EpisodeEntity, "fileInfos">;

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
      .getMany( {
        criteria: {
          expand: ["fileInfos"],
        },
      } ) as EpisodeEntityWithFileInfos[];

    for (const episodeWithFileInfos of allEpisodesWithFileInfos)
      putModelInSerieFolderTree(episodeWithFileInfos, serieFolderTree);

    return serieFolderTree;
  }
}

export function putModelInSerieFolderTree(
  episodeEntity: EpisodeEntityWithFileInfos,
  serieFolderTree: SerieTree,
): SerieTree {
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
