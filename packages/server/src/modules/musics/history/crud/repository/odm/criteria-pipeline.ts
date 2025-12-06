import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { FilterQuery, PipelineStage, Types } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { enrichSingleMusic, MusicExpansionFlags } from "#musics/crud/repositories/music/odm/pipeline-utils";
import { DocOdm } from "./odm";

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
  const userIdStr = criteria.filter?.userId;

  assertIsDefined(userIdStr);

  filter.userId = new Types.ObjectId(userIdStr);

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
  const pipeline: PipelineStage[] = [{
    $match: filter,
  }];

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

  // Configurar flags heredados
  const needsMusics = criteria.expand?.includes("musics");

  if (needsMusics) {
    // 1. Lookup básico de la música (necesario para tener el objeto music)
    pipeline.push(
      {
        $lookup: {
          from: "musics",
          localField: "musicId",
          foreignField: "_id",
          as: "music",
        },
      },
      {
        $addFields: {
          music: {
            $arrayElemAt: ["$music", 0],
          },
        },
      },
    );

    // 2. Usar la utilidad compartida para enriquecer "music"
    // He añadido mapeos heurísticos para flags que quizás quieras usar en el futuro
    const flags: MusicExpansionFlags = {
      includeUserInfo: true, // Por defecto en historial solemos querer el user info
      includeFileInfos: criteria.expand?.includes("musicsFileInfos"),
      // He añadido soporte para 'favorite' aunque no estaba explicito en tu archivo original
      includeFavorite: criteria.expand?.includes("musicsFavorite"),
    };
    // Usamos el userId del filtro, ya que el historial pertenece a un usuario
    const userId = criteria.filter?.userId || null;

    // Llamada a la utilidad. Notar targetField = "music" y localField = "music._id"
    pipeline.push(...enrichSingleMusic("music._id", "music", userId, flags));
  }

  return pipeline;
}
