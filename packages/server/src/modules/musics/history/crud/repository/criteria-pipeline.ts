import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { FilterQuery, PipelineStage, Types } from "mongoose";
import { DocOdm } from "#musics/file-info/crud/repository";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";

function buildMongooseSort(
  body: MusicHistoryEntryCrudDtos.GetManyByCriteria.Criteria,
): Record<string, -1 | 1> | undefined {
  if (!body.sort?.timestamp)
    return undefined;

  return {
    "date.timestamp": body.sort.timestamp === "asc" ? 1 : -1,
  };
}

function buildMongooseFilter(
  criteria: MusicHistoryEntryCrudDtos.GetManyByCriteria.Criteria,
): FilterQuery<DocOdm> {
  const filter: FilterQuery<DocOdm> = {};

  if (criteria.filter) {
    if (criteria.filter.resourceId)
      filter["musicId"] = new Types.ObjectId(criteria.filter.resourceId);

    if (criteria.filter.timestampMax !== undefined) {
      filter["date.timestamp"] = {
        $lte: criteria.filter.timestampMax,
      };
    }
  }

  return filter;
}

export function getCriteriaPipeline(
  criteria: MusicHistoryEntryCrudDtos.GetManyByCriteria.Criteria,
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
    if (criteria.expand.includes("musics")) {
      pipeline.push( {
        $lookup: {
          from: "musics", // nombre de la colección de músicas
          let: {
            musicId: "$musicId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$musicId"],
                },
              },
            },
          ],
          as: "music",
        },
      } );

      // Convertir el array a objeto único
      pipeline.push( {
        $addFields: {
          music: {
            $arrayElemAt: ["$music", 0],
          },
        },
      } );
    }

    if (criteria.expand.includes("music-file-infos") && criteria.expand.includes("musics")) {
      // Ahora expandir los fileInfos de la música
      pipeline.push( {
        $lookup: {
          from: MusicFileInfoOdm.COLLECTION_NAME,
          localField: "music._id",
          foreignField: "musicId",
          as: "musicFileInfos",
        },
      } );

      // Añadir los fileInfos a la música
      pipeline.push( {
        $addFields: {
          "music.fileInfos": "$musicFileInfos",
        },
      } );

      // Limpiar el campo temporal
      pipeline.push( {
        $unset: "musicFileInfos",
      } );
    }
  }

  return pipeline;
}
