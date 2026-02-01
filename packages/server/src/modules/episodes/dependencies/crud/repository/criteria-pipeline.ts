import type { EpisodeDependencyCrudDtos } from "$shared/models/episodes/dependencies/dto/transport";
import type { PipelineStage } from "mongoose";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { DocOdm } from "./odm/odm";

function buildMongooseSort(
  _body: EpisodeDependencyCrudDtos.GetMany.Criteria,
): MongoSortQuery<DocOdm> | undefined {
  return undefined;
}

function buildMongooseFilter(
  criteria: EpisodeDependencyCrudDtos.GetMany.Criteria,
): MongoFilterQuery<DocOdm> {
  const filter: MongoFilterQuery<DocOdm> = {};

  if (criteria.filter) {
    if (criteria.filter.lastCompKey)
      filter["lastCompKey"] = criteria.filter.lastCompKey;
  }

  return filter;
}

export function getCriteriaPipeline(
  criteria: EpisodeDependencyCrudDtos.GetMany.Criteria,
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
      // Lookup para el episodio lastCompKey
      pipeline.push( {
        $lookup: {
          from: "episodes", // nombre de la colección de episodios
          let: {
            lastSeriesKey: "$lastCompKey.seriesKey",
            lastEpisodeKey: "$lastCompKey.episodeKey",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$seriesKey", "$lastSeriesKey"],
                    },
                    {
                      $eq: ["$episodeKey", "$lastEpisodeKey"],
                    },
                  ],
                },
              },
            },
          ],
          as: "last",
        },
      } );

      // Lookup para el episodio nextCompKey
      pipeline.push( {
        $lookup: {
          from: "episodes", // nombre de la colección de episodios
          let: {
            nextSeriesKey: "$nextCompKey.seriesKey",
            nextEpisodeKey: "$nextCompKey.episodeKey",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$seriesKey", "$nextSeriesKey"],
                    },
                    {
                      $eq: ["$episodeKey", "$nextEpisodeKey"],
                    },
                  ],
                },
              },
            },
          ],
          as: "next",
        },
      } );

      // Convertir los arrays a objetos únicos
      pipeline.push( {
        $addFields: {
          last: {
            $arrayElemAt: ["$last", 0],
          },
          next: {
            $arrayElemAt: ["$next", 0],
          },
        },
      } );
    }
  }

  return pipeline;
}
