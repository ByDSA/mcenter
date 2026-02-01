import type { PipelineStage } from "mongoose";
import { StreamCrudDtos } from "$shared/models/episodes/streams/dto/transport";
import { EpisodeHistoryEntryOdm } from "#episodes/history/crud/repository/odm";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";

type CriteriaMany = StreamCrudDtos.GetMany.Criteria;

export function buildCriteriaPipeline(criteria: CriteriaMany): PipelineStage[] {
  const pipeline: PipelineStage[] = [];

  // Lookup para obtener el último historial de reproducción
  // si necesitamos ordenar por lastTimePlayed
  if (criteria.sort?.lastTimePlayed) {
    pipeline.push( {
      $lookup: {
        from: EpisodeHistoryEntryOdm.COLLECTION_NAME,
        let: {
          streamId: "$_id",
          seriesKey: {
            $arrayElemAt: ["$group.origins.id", 0],
          },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$streamId", "$$streamId"],
                  },
                  {
                    $eq: ["$episodeCompKey.seriesKey", "$$seriesKey"],
                  },
                ],
              },
            },
          },
          {
            $sort: {
              "date.timestamp": -1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "lastHistoryEntry",
      },
    } );

    // Agregar campo para ordenación
    pipeline.push( {
      $addFields: {
        lastTimePlayed: {
          $cond: {
            if: {
              $gt: [{
                $size: "$lastHistoryEntry",
              }, 0],
            },
            then: {
              $arrayElemAt: ["$lastHistoryEntry.date.timestamp", 0],
            },
            else: 0,
          },
        },
      },
    } );
  }

  // Lookup para expandir series si es necesario
  if (criteria.expand?.includes("series")) {
    pipeline.push( {
      $lookup: {
        from: SeriesOdm.COLLECTION_NAME,
        let: {
          origins: "$group.origins",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$key", {
                  $map: {
                    input: {
                      $filter: {
                        input: "$$origins",
                        cond: {
                          $eq: ["$this.type", "serie"],
                        },
                      },
                    },
                    as: "origin",
                    in: "$$origin.id",
                  },
                }],
              },
            },
          },
        ],
        as: "seriesData",
      },
    } );

    // Procesar los datos de series para añadirlos a los origins correspondientes
    pipeline.push( {
      $addFields: {
        "group.origins": {
          $map: {
            input: "$group.origins",
            as: "origin",
            in: {
              $mergeObjects: [
                "$$origin",
                {
                  serie: {
                    $cond: {
                      if: {
                        $eq: ["$origin.type", "serie"],
                      },
                      then: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$seriesData",
                              cond: {
                                $eq: ["$$this.key", "$$origin.id"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      else: "$$REMOVE",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    } );

    // Limpiar campo temporal
    pipeline.push( {
      $unset: "seriesData",
    } );
  }

  // Aplicar ordenación si es necesaria
  if (criteria.sort?.lastTimePlayed) {
    pipeline.push( {
      $sort: {
        lastTimePlayed: criteria.sort.lastTimePlayed === "asc" ? 1 : -1,
      },
    } );

    // Limpiar campos temporales de ordenación
    pipeline.push( {
      $unset: ["lastHistoryEntry", "lastTimePlayed"],
    } );
  }

  // Aplicar paginación
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

  return pipeline;
}
