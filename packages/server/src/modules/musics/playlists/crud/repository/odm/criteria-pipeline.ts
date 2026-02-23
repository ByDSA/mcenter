import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { MongoFilterQuery } from "#utils/layers/db/mongoose";
import { MusicPlaylistCrudDtos } from "#musics/playlists/models/dto";
import { MusicExpansionFlags, enrichMusicList } from "#musics/crud/repositories/music/odm/pipeline-utils";
import { enrichImageCover } from "#modules/image-covers/crud/repositories/odm/utils";
import { COLLECTION as MUSIC_USER_LISTS_COLLECTION } from "#musics/users-lists/crud/repository/odm/odm";
import { DocOdm, FullDocOdm } from "./odm";
import { enrichOwnerUserPublic } from "./pipeline-utils";

export type AggregationResult = {
  data: FullDocOdm[];
  metadata: {
    totalCount?: number;
  }[];
}[];

type Criteria = MusicPlaylistCrudDtos.GetMany.Criteria;

function buildMongooseSort(body: Criteria): Record<string, -1 | 1> | undefined {
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

  if (Object.keys(ret).length > 0)
    ret["_id"] = 1;

  return ret;
}

/**
 * Genera las etapas de pipeline para ordenar playlists según el orden
 * custom que el usuario ha definido en music_users_lists (solo entradas type:"playlist").
 * Las playlists no presentes en la lista del usuario van al final.
 */
function buildUserSortStages(
  requestUserId: string,
  direction: "asc" | "desc",
): PipelineStage[] {
  const sortDir = direction === "asc" ? 1 : -1;

  return [
    // 1. Lookup del documento de lista del usuario, extrayendo solo los resourceIds
    //    de las entradas de tipo "playlist", respetando su orden original en el array
    {
      $lookup: {
        from: MUSIC_USER_LISTS_COLLECTION,
        let: {
          userId: new Types.ObjectId(requestUserId),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$ownerUserId", "$$userId"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              playlistIds: {
                $map: {
                  input: {
                    $filter: {
                      input: "$list",
                      as: "entry",
                      cond: {
                        $eq: ["$$entry.type", "playlist"],
                      },
                    },
                  },
                  as: "entry",
                  in: "$$entry.resourceId",
                },
              },
            },
          },
        ],
        as: "__userListResult",
      },
    } as PipelineStage,
    // 2. Calcular el índice de esta playlist dentro del orden del usuario.
    //    Las playlists que no están en la lista reciben 999999 para ir al final.
    {
      $addFields: {
        __userSortIndex: {
          $let: {
            vars: {
              orderedIds: {
                $ifNull: [
                  {
                    $arrayElemAt: ["$__userListResult.playlistIds", 0],
                  },
                  [],
                ],
              },
            },
            in: {
              $let: {
                vars: {
                  idx: {
                    $indexOfArray: ["$$orderedIds", "$_id"],
                  },
                },
                in: {
                  $cond: {
                    if: {
                      $eq: ["$$idx", -1],
                    },
                    then: 999999,
                    else: "$$idx",
                  },
                },
              },
            },
          },
        },
      },
    } as PipelineStage,
    // 3. Ordenar por el índice calculado
    {
      $sort: {
        __userSortIndex: sortDir,
      },
    } as PipelineStage,
    // 4. Limpiar campos temporales
    {
      $unset: ["__userListResult", "__userSortIndex"],
    } as PipelineStage,
  ];
}

export function getCriteriaPipeline(criteria: Criteria, requestUserId: string | null) {
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [];
  const filter = buildMongooseFilter(criteria);

  if (Object.keys(filter).length > 0) {
    pipeline.push( {
      $match: filter,
    } );
  }

  if (criteria.filter?.ownerUserSlug) {
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "__userFilterInfo", // Campo temporal
        },
      },
      {
        $match: {
          "__userFilterInfo.publicUsername": criteria.filter.ownerUserSlug,
        },
      },
      {
        $unset: "__userFilterInfo", // Limpiamos el documento para no ensuciar el resultado
      },
    );
  }

  const facetStage: PipelineStage = {
    $facet: {
      data: [],
      metadata: [{
        $count: "totalCount",
      }],
    },
  };
  const dataPipeline: PipelineStage[] = [];

  // Ordenación estándar (added / updated)
  if (sort) {
    dataPipeline.push( {
      $sort: sort,
    } );
  }

  // Ordenación custom del usuario: se aplica antes del skip/limit para que
  // la paginación respete el orden correcto
  if (criteria.sort?.user && requestUserId)
    dataPipeline.push(...buildUserSortStages(requestUserId, criteria.sort.user));

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

  // Lógica de expansión usando la utilidad compartida
  if (criteria.expand?.includes("musics")) {
    const flags: MusicExpansionFlags = {
      // En playlists, fileInfos suele ir implícito
      // si se piden músicas, o puedes agregar un flag especifico
      includeFileInfos: true,
      includeFavorite: criteria.expand?.includes("musicsFavorite"),
      // UserInfo (stats del usuario sobre la canción) normalmente no se pide en listas de playlist,
      // pero si lo añadieras al DTO, aquí solo tendrías que poner 'true'.
      includeUserInfo: false,
    };

    // Usamos la función optimizada para arrays
    dataPipeline.push(...enrichMusicList("list", requestUserId, flags));
  }

  if (criteria.expand?.includes("ownerUserPublic")) {
    dataPipeline.push(
      ...enrichOwnerUserPublic( {
        localField: "userId",
        targetField: "ownerUserPublic",
      } ),
    );
  }

  if (criteria.expand?.includes("imageCover"))
    dataPipeline.push(...enrichImageCover());

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

    if (criteria.filter.ownerUserId)
      filter["userId"] = new Types.ObjectId(criteria.filter.ownerUserId);
  }

  return filter;
}
