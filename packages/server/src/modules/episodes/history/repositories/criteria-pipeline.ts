import type { EpisodeHistoryEntryRestDtos } from "$shared/models/episodes/history/dto/transport";
import type { FilterQuery, PipelineStage } from "mongoose";
import { DocOdm } from "./odm/mongo";

function buildMongooseSort(
  body: EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria,
): Record<string, -1 | 1> | undefined {
  if (!body.sort?.timestamp)
    return undefined;

  return {
    "date.timestamp": body.sort.timestamp === "asc" ? 1 : -1,
  };
}

function buildMongooseFilter(
  criteria: EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria,
): FilterQuery<DocOdm> {
  const filter: FilterQuery<DocOdm> = {};

  if (criteria.filter) {
    if (criteria.filter.seriesKey)
      filter["episodeId.serieId"] = criteria.filter.seriesKey;

    if (criteria.filter.episodeKey)
      filter["episodeId.code"] = criteria.filter.episodeKey;

    if (criteria.filter.timestampMax !== undefined) {
      filter["date.timestamp"] = {
        $lte: criteria.filter.timestampMax,
      };
    }
  }

  return filter;
}

export function getCriteriaPipeline(
  criteria: EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria,
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
    if (criteria.expand.includes("series")) {
      pipeline.push( {
        $lookup: {
          from: "series", // nombre de la colección de series
          localField: "episodeId.serieId",
          foreignField: "id",
          as: "serie",
        },
      } );

      // Convertir el array a objeto único
      pipeline.push( {
        $addFields: {
          serie: {
            $arrayElemAt: ["$serie", 0],
          },
        },
      } );
    }

    if (criteria.expand.includes("episodes")) {
      pipeline.push( {
        $lookup: {
          from: "episodes", // nombre de la colección de episodios
          let: {
            serieId: "$episodeId.serieId",
            code: "$episodeId.code",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$serieId", "$$serieId"],
                    },
                    {
                      $eq: ["$episodeId", "$$code"],
                    },
                  ],
                },
              },
            },
          ],
          as: "episode",
        },
      } );

      // Convertir el array a objeto único
      pipeline.push( {
        $addFields: {
          episode: {
            $arrayElemAt: ["$episode", 0],
          },
        },
      } );
    }

    if (criteria.expand.includes("episode-file-infos") && criteria.expand.includes("episodes")) {
      // Ahora expandir los fileInfos del episode
      pipeline.push( {
        $lookup: {
          from: "episodefileinfos", // nombre de la colección de episode file infos
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
  }

  return pipeline;
}
