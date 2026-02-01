import type { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import { Types, type PipelineStage } from "mongoose";
import { WithRequired } from "$shared/utils/objects";
import { assertIsDefined } from "$shared/utils/validation";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { EpisodesUsersOdm } from "#episodes/crud/repositories/user-infos/odm";
import { assertFoundClient } from "#utils/validation/found";
import { DocOdm, FullDocOdm } from "./odm/odm";

function buildMongooseSort(
  body: EpisodeHistoryEntryCrudDtos.GetMany.Criteria,
): MongoSortQuery<DocOdm> | undefined {
  if (!body.sort?.timestamp)
    return undefined;

  return {
    "date.timestamp": body.sort.timestamp === "asc" ? 1 : -1,
  };
}

function buildMongooseFilter(
  criteria: EpisodeHistoryEntryCrudDtos.GetMany.Criteria,
): MongoFilterQuery<DocOdm> {
  const filter: MongoFilterQuery<WithRequired<FullDocOdm, "episode"> & {
    episode: {
      serie: NonNullable<Required<FullDocOdm>["episode"]["serie"]>;
    };
  }> = {};
  const userIdStr = criteria.filter?.userId;

  assertIsDefined(userIdStr);

  filter.userId = new Types.ObjectId(userIdStr);

  if (criteria.filter) {
    if (criteria.filter.seriesKey) {
      assertFoundClient(
        criteria.expand?.includes("episodes"),
        "Lookup episodes is required to filter by seriesKey",
      );
      filter["episode.seriesKey"] = criteria.filter.seriesKey;
    }

    if (criteria.filter.episodeKey) {
      assertFoundClient(
        criteria.expand?.includes("episodes"),
        "Lookup episodes is required to filter by episodeKey",
      );
      filter["episode.episodeKey"] = criteria.filter.episodeKey;
    }

    if (criteria.filter.timestampMax !== undefined) {
      filter["date.timestamp"] = {
        $lte: criteria.filter.timestampMax,
      };
    }
  }

  return filter;
}

export function getCriteriaPipeline(
  criteria: EpisodeHistoryEntryCrudDtos.GetMany.Criteria,
) {
  const filter = buildMongooseFilter(criteria);
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [
    {
      $match: filter,
    },
  ];

  if (sort) {
    pipeline.push( {
      $sort: sort,
    } );
  }

  if (criteria.offset) {
    pipeline.push( {
      $skip: criteria.offset,
    } );
  }

  if (criteria.limit) {
    pipeline.push( {
      $limit: criteria.limit,
    } );
  }

  // Agregar lookups para expand
  if (criteria.expand) {
    if (criteria.expand.includes("episodes")) {
      const episodesLookUp = {
        $lookup: {
          from: "episodes",
          localField: "episodeId",
          foreignField: "_id",
          as: "episode",
        },
      };

      if (criteria.filter?.episodeKey || criteria.filter?.seriesKey)
        pipeline.unshift(episodesLookUp);
      else
        pipeline.push(episodesLookUp);

      // Convertir el array a objeto único
      pipeline.push( {
        $addFields: {
          episode: {
            $arrayElemAt: ["$episode", 0],
          },
        },
      } );

      // Si también se solicita series, agregarlo al episode
      if (criteria.expand.includes("episodesSeries")) {
        pipeline.push( {
          $lookup: {
            from: "series",
            localField: "episode.seriesKey",
            foreignField: "key",
            as: "serieTemp",
          },
        } );

        // Añadir la serie al episode
        pipeline.push( {
          $addFields: {
            "episode.serie": {
              $arrayElemAt: ["$serieTemp", 0],
            },
          },
        } );

        // Limpiar el campo temporal
        pipeline.push( {
          $unset: "serieTemp",
        } );
      }

      if (criteria.expand.includes("episodesFileInfos")) {
        pipeline.push( {
          $lookup: {
            from: EpisodeFileInfoOdm.COLLECTION_NAME,
            localField: "episode._id",
            foreignField: "episodeId",
            as: "episodeFileInfos",
          },
        } );

        // Añadir los fileInfos al episode
        pipeline.push( {
          $addFields: {
            "episode.fileInfos": "$episodeFileInfos",
          },
        } );

        // Limpiar el campo temporal
        pipeline.push( {
          $unset: "episodeFileInfos",
        } );
      }

      if (criteria.expand.includes("episodesUserInfo")) {
        pipeline.push( {
          $lookup: {
            from: EpisodesUsersOdm.COLLECTION_NAME,
            localField: "episode._id",
            foreignField: "episodeId",
            as: "tmp",
          },
        } );

        // Añadir al episode
        pipeline.push( {
          $addFields: {
            "episode.userInfo": {
              $arrayElemAt: ["$tmp", 0],
            },

          },
        } );

        // Limpiar el campo temporal
        pipeline.push( {
          $unset: "tmp",
        } );
      }
    }
  }

  return pipeline;
}
