import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { MongoFilterQuery } from "#utils/layers/db/mongoose";
import { MusicPlaylistCrudDtos } from "#musics/playlists/models/dto";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { FullDocOdm } from "./odm";
import { DocOdm } from "./odm";

type Criteria = MusicPlaylistCrudDtos.GetMany.Criteria;

function buildMongooseSort(
  body: Criteria,
): Record<string, -1 | 1> | undefined {
  if (!body.sort)
    return undefined;

  const { added, updated } = body.sort;

  if (!added && !updated)
    return undefined;

  const ret: Record<string, -1 | 1> | undefined = {};

  if (added)
    ret["timestamps.addedAt"] = added === "asc" ? 1 : -1;

  if (updated)
    ret["timestamps.updatedAt"] = updated === "asc" ? 1 : -1;

  // Importante para hacerlo determinista!
  // Si dos elementos tienen el mismo valor de sort, no es determinista
  // y puede devolver duplicados y omisiones en pagging
  if (Object.keys(ret).length > 0)
    ret["_id"] = 1;

  return ret;
}

export type AggregationResult = {
  data: FullDocOdm[];
  metadata: {
    totalCount?: number;
  }[];
}[];

export function getCriteriaPipeline(
  criteria: Criteria,
) {
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [];
  // Construir filtro después del lookup si es necesario
  const filter = buildMongooseFilter(criteria);

  if (Object.keys(filter).length > 0) {
    pipeline.push( {
      $match: filter,
    } );
  }

  // Usar $facet para obtener datos paginados y total en una sola consulta
  const facetStage: PipelineStage = {
    $facet: {
      data: [],
      metadata: [
        {
          $count: "totalCount",
        },
      ],
    },
  };
  // Construir el pipeline de datos
  const dataPipeline: PipelineStage[] = [];

  // Sort antes de la paginación
  if (sort) {
    dataPipeline.push( {
      $sort: sort,
    } );
  }

  // Paginación
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

  if (criteria.expand?.includes("musics")) {
    // Esta aproximación evita el $group completamente
    dataPipeline.push(
      // Expandir cada elemento de la lista con lookup
      {
        $lookup: {
          from: "musics",
          let: {
            listItems: "$list",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$listItems.musicId"],
                },
              },
            },
          ],
          as: "musicsExpanded",
        },
      },
      // Lookup para obtener fileinfos de cada música
      {
        $lookup: {
          from: MusicFileInfoOdm.COLLECTION_NAME,
          let: {
            musicIds: {
              $map: {
                input: "$musicsExpanded",
                in: "$$this._id",
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$musicId", "$$musicIds"],
                },
              },
            },
          ],
          as: "fileInfosExpanded",
        },
      },
      // Crear un mapa de música por ID para lookup rápido
      {
        $addFields: {
          musicMap: {
            $arrayToObject: {
              $map: {
                input: "$musicsExpanded",
                in: {
                  k: {
                    $toString: "$$this._id",
                  },
                  v: "$$this",
                },
              },
            },
          },
          // Crear un mapa agrupado de fileInfos por musicId
          fileInfosMap: {
            $arrayToObject: {
              $map: {
                input: {
                  $setUnion: {
                    $map: {
                      input: "$fileInfosExpanded",
                      in: {
                        $toString: "$$this.musicId",
                      },
                    },
                  },
                },
                in: {
                  k: "$$this",
                  v: {
                    $filter: {
                      input: "$fileInfosExpanded",
                      as: "fileInfo",
                      cond: {
                        $eq: [
                          {
                            $toString: "$$fileInfo.musicId",
                          },
                          "$$this",
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // Expandir la lista con la música y fileInfos correspondientes
      {
        $addFields: {
          list: {
            $map: {
              input: "$list",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    music: {
                      $mergeObjects: [
                        {
                          $getField: {
                            field: {
                              $toString: "$$this.musicId",
                            },
                            input: "$musicMap",
                          },
                        },
                        {
                          fileInfos: {
                            $ifNull: [
                              {
                                $getField: {
                                  field: {
                                    $toString: "$$this.musicId",
                                  },
                                  input: "$fileInfosMap",
                                },
                              },
                              [],
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      // Limpiar campos temporales
      {
        $unset: ["musicsExpanded", "musicMap", "fileInfosExpanded", "fileInfosMap"],
      },
    );
  }

  // Asignar el pipeline de datos al facet
  (facetStage.$facet as any).data = dataPipeline;

  pipeline.push(facetStage);

  return pipeline;
}

function buildMongooseFilter(
  criteria: MusicPlaylistCrudDtos.GetMany.Criteria,
): FilterQuery<any> {
  const filter: MongoFilterQuery<DocOdm> = {};

  if (criteria.filter) {
    if (criteria.filter.id)
      filter["_id"] = new Types.ObjectId(criteria.filter.id);

    if (criteria.filter.slug)
      filter["slug"] = criteria.filter.slug;

    if (criteria.filter.userId)
      filter["userId"] = new Types.ObjectId(criteria.filter.userId);
  }

  return filter;
}
