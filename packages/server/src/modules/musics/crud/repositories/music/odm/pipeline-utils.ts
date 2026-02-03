/* eslint-disable multiline-ternary */
/* eslint-disable camelcase */
// music-pipeline-utils.ts
import { PipelineStage, Types } from "mongoose";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { enrichImageCover } from "#modules/image-covers/crud/repositories/odm/utils";
import { MusicsUsersOdm } from "../../user-info/odm";

// Ajusta el path según tu estructura
export interface MusicExpansionFlags {
  includeUserInfo?: boolean;
  includeFileInfos?: boolean;
  includeFavorite?: boolean;
  includeImageCover?: boolean;
}

/**
 * Estrategia para documentos "Singulares" (Musics Collection o History)
 * Asume que el documento principal fluye por el pipeline uno a uno.
 */
type EnrichMusicProps = {
  localMusicIdField: string; // Ej: "_id" o "musicId"
  targetField: string | null; // Ej: null (merge en root) o "music"
  userId: string | null;
  flags: MusicExpansionFlags;
};
export function enrichSingleMusic( { localMusicIdField,
  flags,
  targetField,
  userId }: EnrichMusicProps): PipelineStage[] {
  const pipeline: PipelineStage[] = [];
  const isRoot = targetField === null;
  const prefix = isRoot ? "" : `${targetField}.`;

  // 1. User Info (musics_users)
  if (flags.includeUserInfo) {
    if (userId) {
      pipeline.push( {
        $lookup: {
          from: "musics_users",
          let: {
            musicId: isRoot ? "$_id" : `$${localMusicIdField}`,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$musicId", "$$musicId"],
                    },
                    {
                      $eq: ["$userId", new Types.ObjectId(userId)],
                    },
                  ],
                },
              },
            },
          ],
          as: "temp_userInfo",
        },
      } );
    } else {
      // Default fake user info si no hay usuario logueado
      const fakeId = new Types.ObjectId();

      pipeline.push( {
        $addFields: {
          temp_userInfo: [{
            _id: fakeId,
            musicId: isRoot ? "$_id" : `$${localMusicIdField}` as any,
            createdAt: new Date(),
            lastTimePlayed: 0,
            updatedAt: new Date(),
            userId: fakeId,
            weight: 0,
          } satisfies MusicsUsersOdm.FullDoc],
        },
      } );
    }

    // Asignar y limpiar
    pipeline.push(
      {
        $unwind: {
          path: "$temp_userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          [`${prefix}userInfo`]: "$temp_userInfo",
        },
      },
      {
        $unset: "temp_userInfo",
      },
    );
  }

  // 2. File Infos
  if (flags.includeFileInfos) {
    pipeline.push( {
      $lookup: {
        from: MusicFileInfoOdm.COLLECTION_NAME,
        localField: localMusicIdField,
        foreignField: "musicId",
        as: isRoot ? "fileInfos" : `${targetField}.fileInfos`,
      },
    } );
  }

  if (flags.includeImageCover) {
    // Calculamos los paths relativos o absolutos según si es root o nested
    const sourceIdPath = isRoot ? "imageCoverId" : `${targetField}.imageCoverId`;
    const destinationPath = isRoot ? "imageCover" : `${targetField}.imageCover`;

    pipeline.push(...enrichImageCover( {
      imageCoverIdField: sourceIdPath,
      imageCoverField: destinationPath,
    } ));
  }

  // 3. Favorites (Lógica compleja de User -> Playlist -> isFound)
  if (flags.includeFavorite) {
    if (!userId)
      throw new Error("User ID is required to expand favorites");

    pipeline.push(
      // A. Buscar ID de playlist de favoritos
      {
        $lookup: {
          from: "users",
          pipeline: [
            {
              $match: {
                _id: new Types.ObjectId(userId),
              },
            },
            {
              $project: {
                _id: 0,
                favPlaylistId: "$musics.favoritesPlaylistId",
              },
            },
          ],
          as: "temp_userFav",
        },
      },
      {
        $unwind: {
          path: "$temp_userFav",
          preserveNullAndEmptyArrays: true,
        },
      },
      // B. Buscar si la canción está en esa playlist
      {
        $lookup: {
          from: "music_playlists",
          let: {
            favPlaylistId: "$temp_userFav.favPlaylistId",
            musicId: isRoot ? "$_id" : `$${localMusicIdField}`,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$favPlaylistId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                isFound: {
                  $in: ["$$musicId", "$list.musicId"],
                },
              },
            },
          ],
          as: "temp_favStatus",
        },
      },
      // C. Calcular booleano
      {
        $addFields: {
          [`${prefix}isFav`]: {
            $cond: {
              if: {
                $gt: [{
                  $size: "$temp_favStatus",
                }, 0],
              },
              then: {
                $arrayElemAt: ["$temp_favStatus.isFound", 0],
              },
              else: false,
            },
          },
        },
      },
      // D. Limpiar
      {
        $unset: ["temp_userFav", "temp_favStatus"],
      },
    );
  }

  return pipeline;
}

/**
 * Estrategia para Arrays de Música (ej: Playlists)
 * Optimizado para no usar $unwind en la lista principal.
 * Asume que existe un campo array (listPath) donde cada elemento tiene { musicId: ObjectId }.
 */
export function enrichMusicList(
  listPath: string, // Ej: "list"
  requestUserId: string | null,
  flags: MusicExpansionFlags,
): PipelineStage[] {
  const pipeline: PipelineStage[] = [];

  // 1. Lookup masivo de Musics (Expandir detalles básicos)
  pipeline.push( {
    $lookup: {
      from: "musics",
      let: {
        listItems: `$${listPath}`,
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
      as: "temp_musicsExpanded",
    },
  } );

  // 2. Lookup masivo de FileInfos
  if (flags.includeFileInfos) {
    pipeline.push( {
      $lookup: {
        from: MusicFileInfoOdm.COLLECTION_NAME,
        let: {
          musicIds: {
            $map: {
              input: "$temp_musicsExpanded",
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
        as: "temp_fileInfosExpanded",
      },
    } );
  }

  // 3. Preparación de Favoritos (Obtener lista de IDs favoritos del usuario una sola vez)
  if (flags.includeFavorite) {
    if (!requestUserId)
      throw new Error("User ID is required to expand favorites");

    pipeline.push(
      {
        $lookup: {
          from: "users",
          pipeline: [
            {
              $match: {
                _id: new Types.ObjectId(requestUserId),
              },
            },
            {
              $project: {
                _id: 0,
                favPlaylistId: "$musics.favoritesPlaylistId",
              },
            },
          ],
          as: "temp_userFav",
        },
      },
      {
        $unwind: {
          path: "$temp_userFav",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "music_playlists",
          let: {
            favPlaylistId: "$temp_userFav.favPlaylistId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$favPlaylistId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                ids: "$list.musicId",
              },
            },
          ],
          as: "temp_favList",
        },
      },
      {
        $addFields: {
          temp_userFavMusicIds: {
            $ifNull: [{
              $arrayElemAt: ["$temp_favList.ids", 0],
            }, []],
          },
        },
      },
    );
  }

  // 4. MAPEO: Cruzar toda la data sin deshacer el array
  pipeline.push(
    // A. Crear Mapas para acceso O(1) en el $map
    {
      $addFields: {
        temp_musicMap: {
          $arrayToObject: {
            $map: {
              input: "$temp_musicsExpanded",
              in: {
                k: {
                  $toString: "$$this._id",
                },
                v: "$$this",
              },
            },
          },
        },
        ...(flags.includeFileInfos ? {
          temp_fileInfosMap: {
            $arrayToObject: {
              $map: {
                input: {
                  // Unique musicIds from fileInfos
                  $setUnion: {
                    $map: {
                      input: "$temp_fileInfosExpanded",
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
                      input: "$temp_fileInfosExpanded",
                      as: "fi",
                      cond: {
                        $eq: [{
                          $toString: "$$fi.musicId",
                        }, "$$this"],
                      },
                    },
                  },
                },
              },
            },
          },
        } : {} ),
      },
    },
    // B. Reconstruir la lista
    {
      $addFields: {
        [listPath]: {
          $map: {
            input: `$${listPath}`,
            in: {
              $mergeObjects: [
                "$$this",
                {
                  music: {
                    $mergeObjects: [
                      // Base Music Data
                      {
                        $getField: {
                          field: {
                            $toString: "$$this.musicId",
                          },
                          input: "$temp_musicMap",
                        },
                      },
                      // FileInfos
                      (flags.includeFileInfos
                        ? {
                          fileInfos: {
                            $ifNull: [
                              {
                                $getField: {
                                  field: {
                                    $toString: "$$this.musicId",
                                  },
                                  input: "$temp_fileInfosMap",
                                },
                              },
                              [],
                            ],
                          },
                        }
                        : {} ),
                      // Favorites
                      (flags.includeFavorite
                        ? {
                          isFav: {
                            $in: ["$$this.musicId", "$temp_userFavMusicIds"],
                          },
                        }
                        : {} ),
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    // C. Limpieza final
    {
      $unset: [
        "temp_musicsExpanded", "temp_musicMap",
        "temp_fileInfosExpanded", "temp_fileInfosMap",
        "temp_userFav", "temp_favList", "temp_userFavMusicIds",
      ],
    },
  );

  return pipeline;
}
