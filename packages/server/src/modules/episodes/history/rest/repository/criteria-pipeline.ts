import type { EpisodeHistoryEntryRestDtos } from "$shared/models/episodes/history/dto/transport";
import type { PipelineStage } from "mongoose";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { DocOdm } from "./odm/mongo";

function buildMongooseSort(
  body: EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria,
): MongoSortQuery<DocOdm> | undefined {
  if (!body.sort?.timestamp)
    return undefined;

  return {
    "date.timestamp": body.sort.timestamp === "asc" ? 1 : -1,
  };
}

function buildMongooseFilter(
  criteria: EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria,
): MongoFilterQuery<DocOdm> {
  const filter: MongoFilterQuery<DocOdm> = {};

  if (criteria.filter) {
    if (criteria.filter.seriesKey)
      filter["episodeCompKey.seriesKey"] = criteria.filter.seriesKey;

    if (criteria.filter.episodeKey)
      filter["episodeCompKey.episodeKey"] = criteria.filter.episodeKey;

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
    if (criteria.expand.includes("episodes")) {
      pipeline.push( {
        $lookup: {
          from: "episodes", // nombre de la colección de episodios
          let: {
            seriesKey: "$episodeCompKey.seriesKey",
            episodeKey: "$episodeCompKey.episodeKey",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$seriesKey", "$$seriesKey"],
                    },
                    {
                      $eq: ["$episodeKey", "$$episodeKey"],
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

      // Si también se solicita series, agregarlo al episode
      if (criteria.expand.includes("series")) {
        pipeline.push( {
          $lookup: {
            from: "series", // nombre de la colección de series
            localField: "episodeCompKey.seriesKey",
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
    } else if (criteria.expand.includes("series")) {
      // Si solo se solicita series sin episodes, crear un episode vacío solo con la serie
      pipeline.push( {
        $lookup: {
          from: "series", // nombre de la colección de series
          localField: "episodeCompKey.seriesKey",
          foreignField: "key",
          as: "serieTemp",
        },
      } );

      pipeline.push( {
        $addFields: {
          episode: {
            serie: {
              $arrayElemAt: ["$serieTemp", 0],
            },
          },
        },
      } );

      // Limpiar el campo temporal
      pipeline.push( {
        $unset: "serieTemp",
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
