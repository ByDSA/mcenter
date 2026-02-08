import type { EpisodeEntity } from "#episodes/models";
import { Injectable } from "@nestjs/common";
import { treePut } from "$shared/utils/trees";
import { WithRequired } from "$shared/utils/objects";
import { Types } from "mongoose";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { assertFoundServer } from "#utils/validation/found";
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
    const ret = await this.episodesRepo
      .getMany( {
        expand: ["fileInfos"],
      } );
    const allEpisodesWithFileInfos = ret.data as EpisodeEntityWithFileInfos[];
    const seriesIdToSeriesKey: Record<string, string> = {};

    for (const episodeWithFileInfos of allEpisodesWithFileInfos) {
      if (!seriesIdToSeriesKey[episodeWithFileInfos.seriesId]) {
        const seriesDoc = await SeriesOdm.Model.findOne( {
          seriesId: new Types.ObjectId(),
        } );

        assertFoundServer(seriesDoc);

        seriesIdToSeriesKey[episodeWithFileInfos.seriesId] = seriesDoc.key;
      }

      putModelInSerieFolderTree(
        episodeWithFileInfos,
        seriesIdToSeriesKey[episodeWithFileInfos.seriesId],
        serieFolderTree,
      );
    }

    return serieFolderTree;
  }
}

export function putModelInSerieFolderTree(
  episodeEntity: EpisodeEntityWithFileInfos,
  seriesKey: string,
  serieFolderTree: SerieTree,
): SerieTree {
  const { episodeKey } = episodeEntity;
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
