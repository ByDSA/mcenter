/* eslint-disable camelcase */
import type { GetManyCriteria } from "../repository";
import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { MongoFilterQuery } from "#utils/layers/db/mongoose";
import { enrichImageCover } from "#modules/image-covers/crud/repositories/odm/utils";

type Criteria = GetManyCriteria;

/**
 * Construye el pipeline de agregación para Series.
 * Soluciona el error de tipos de Facet enviando las etapas como 'any'
 * para evitar la incompatibilidad de PipelineStage vs FacetPipelineStage.
 */
export function getSeriesCriteriaPipeline(criteria: Criteria): PipelineStage[] {
  const pipeline: PipelineStage[] = [];
  // 1. Filtros Iniciales
  const filter = buildSeriesFilter(criteria);

  if (Object.keys(filter).length > 0) {
    pipeline.push( {
      $match: filter,
    } );
  }

  const dataPipeline: PipelineStage[] = [];
  // 2. Sort y Paginación
  const hasCustomSort = criteria.sort && (criteria.sort.added || criteria.sort.updated
    || criteria.sort.title);

  if (hasCustomSort) {
    const sortStage: any = {};

    if (criteria.sort!.added)
      sortStage["addedAt"] = criteria.sort!.added === "asc" ? 1 : -1;

    if (criteria.sort!.updated)
      sortStage["updatedAt"] = criteria.sort!.updated === "asc" ? 1 : -1;

    if (criteria.sort!.title)
      sortStage["title"] = criteria.sort!.title === "asc" ? 1 : -1;

    dataPipeline.push( {
      $sort: sortStage,
    } );
  } else {
    // Si NO hay sort explícito, aplicamos la lógica por defecto
    addDefaultSortStage(dataPipeline, criteria.requestUserId);
  }

  if (criteria.offset) {
    dataPipeline.push( {
      $skip: criteria.offset,
    } );
  }

  if (criteria.limit) {
    dataPipeline.push( {
      $limit: criteria.limit,
    } );
  }

  // 3. Expansiones
  const expand = criteria.expand || [];

  if (expand.includes("countEpisodes") || expand.includes("countSeasons")) {
    dataPipeline.push( {
      $lookup: {
        from: "episodes",
        localField: "_id",
        foreignField: "seriesId",
        as: "rawEpisodes",
      },
    } );

    if (expand.includes("countEpisodes")) {
      dataPipeline.push( {
        $addFields: {
          countEpisodes: {
            $size: "$rawEpisodes",
          },
        },
      } );
    }

    if (expand.includes("countSeasons")) {
      dataPipeline.push( {
        $addFields: {
          countSeasons: {
            $size: {
              $reduce: {
                input: "$rawEpisodes",
                initialValue: [],
                in: {
                  $let: {
                    vars: {
                      hasSeparator: {
                        $regexMatch: {
                          input: "$$this.episodeKey",
                          regex: /x/i,
                        },
                      },
                    },
                    in: {
                      $let: {
                        vars: {
                          season: {
                            $cond: [
                              "$$hasSeparator",
                              {
                                $let: {
                                  vars: {
                                    part: {
                                      $arrayElemAt: [{
                                        $split: ["$$this.episodeKey", "x"],
                                      }, 0],
                                    },
                                  },
                                  in: {
                                    $cond: [
                                      {
                                        $regexMatch: {
                                          input: "$$part",
                                          regex: /^\d+$/,
                                        },
                                      },
                                      "$$part",
                                      "0",
                                    ],
                                  },
                                },
                              },
                              "0",
                            ],
                          },
                        },
                        in: {
                          $setUnion: ["$$value", ["$$season"]],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      } );
    }

    dataPipeline.push( {
      $project: {
        rawEpisodes: 0,
      },
    } );
  }

  if (criteria.expand?.includes("imageCover"))
    dataPipeline.push(...enrichImageCover());

  // 4. Facet Stage
  const facetStage: PipelineStage.Facet = {
    $facet: {
      data: dataPipeline as any,
      metadata: [{
        $count: "totalCount",
      }],
    },
  };

  pipeline.push(facetStage);

  return pipeline;
}

function buildSeriesFilter(criteria: Criteria): FilterQuery<any> {
  const filter: MongoFilterQuery<any> = {};

  if (criteria.filter) {
    if (criteria.filter.id)
      filter["_id"] = new Types.ObjectId(criteria.filter.id);

    if (criteria.filter.ids) {
      filter["_id"] = {
        $in: criteria.filter.ids.map(id => new Types.ObjectId(id)),
      };
    }

    if (criteria.filter.title) {
      filter["title"] = {
        $regex: criteria.filter.title,
        $options: "i",
      };
    }

    if (criteria.filter.search) {
      filter["$or"] = [
        {
          title: {
            $regex: criteria.filter.search,
            $options: "i",
          },
        },
        {
          key: {
            $regex: criteria.filter.search,
            $options: "i",
          },
        },
      ];
    }
  }

  return filter;
}

/**
 * Agrega al pipeline la lógica de ordenamiento por defecto:
 * Max( Series.updatedAt, Max(History.date.timestamp) ) DESC
 */
function addDefaultSortStage(pipeline: PipelineStage[], userId: string | null): void {
  // 1. Si hay usuario, necesitamos buscar su historial para esta serie
  if (userId) {
    // Necesitamos los IDs de los episodios para cruzar con el historial
    pipeline.push( {
      $lookup: {
        from: "episodes",
        localField: "_id",
        foreignField: "seriesId",
        pipeline: [{
          $project: {
            _id: 1,
          },
        }],
        as: "_def_episodes",
      },
    } );

    pipeline.push( {
      $lookup: {
        from: "episode_history_entries",
        let: {
          episodeIds: "$_def_episodes._id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$episodeId", "$$episodeIds"],
                  },
                  {
                    $eq: ["$userId", new Types.ObjectId(userId)],
                  },
                ],
              },
            },
          },
          {
            $project: {
              "date.timestamp": 1,
            },
          },
        ],
        as: "_def_history",
      },
    } );

    // Calcular el timestamp máximo del historial
    pipeline.push( {
      $addFields: {
        _def_max_history_ts: {
          $max: "$_def_history.date.timestamp",
        },
      },
    } );
  }

  // 2. Calcular la métrica de ordenamiento final
  pipeline.push( {
    $addFields: {
      _def_sort_metric: {
        $max: [
          // Fecha 1: El updatedAt de la propia serie (ISODate)
          {
            $ifNull: ["$updatedAt", new Date(0)],
          },

          // Fecha 2: Última visualización calculada desde el historial
          userId
            ? {
              $add: [
                new Date(0),
                {
                  $multiply: [{
                    $ifNull: ["$_def_max_history_ts", 0],
                  }, 1000],
                },
              ],
            }
            : new Date(0),
        ],
      },
    },
  } );

  // 3. Aplicar el Sort Descendente
  pipeline.push( {
    $sort: {
      _def_sort_metric: -1,
    },
  } );

  // 4. Limpieza de campos temporales
  pipeline.push( {
    $project: {
      _def_episodes: 0,
      _def_history: 0,
      _def_max_history_ts: 0,
      _def_sort_metric: 0,
    },
  } );
}
