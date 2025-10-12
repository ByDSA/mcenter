import type { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import type { FilterQuery, PipelineStage } from "mongoose";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { DocOdm as EpisodeDocOdm } from "./odm";

// Asumiendo que tienes un ODM para Episode
function buildMongooseSort(
  body: EpisodesCrudDtos.GetManyByCriteria.Criteria,
): MongoSortQuery<EpisodeDocOdm> | undefined {
  if (!body.sort)
    return undefined;

  const sortObj: MongoSortQuery<EpisodeDocOdm> = {};

  // Ejemplo de ordenación por diferentes campos
  if (body.sort.episodeCompKey) {
    sortObj["seriesKey"] = body.sort.episodeCompKey === "asc" ? 1 : -1;
    sortObj["episodeKey"] = body.sort.episodeCompKey === "asc" ? 1 : -1;
  }

  if (body.sort.createdAt)
    sortObj["timestamps.createdAt"] = body.sort.createdAt === "asc" ? 1 : -1;

  if (body.sort.updatedAt)
    sortObj["timestamps.updatedAt"] = body.sort.updatedAt === "asc" ? 1 : -1;

  return Object.keys(sortObj).length > 0 ? sortObj as Record<string, -1 | 1> : undefined;
}

function buildMongooseFilter(
  criteria: EpisodesCrudDtos.GetManyByCriteria.Criteria,
): FilterQuery<EpisodeDocOdm> {
  const filter: MongoFilterQuery<EpisodeDocOdm> = {};

  if (criteria.filter) {
    if (criteria.filter.seriesKey)
      filter["seriesKey"] = criteria.filter.seriesKey;

    if (criteria.filter.episodeKey)
      filter["episodeKey"] = criteria.filter.episodeKey;

    if (
      criteria.filter.episodeKeys && criteria.filter.episodeKeys.length > 0
    ) {
      filter["episodeKey"] = {
        $in: criteria.filter.episodeKeys,
      };
    }

    if (criteria.filter.seriesKeys && criteria.filter.seriesKeys.length > 0) {
      filter["seriesKey"] = {
        $in: criteria.filter.seriesKeys,
      };
    }

    // No incluimos el filtro de path aquí porque necesita el lookup primero
  }

  return filter;
}

function buildFileInfoFilter(
  criteria: EpisodesCrudDtos.GetManyByCriteria.Criteria,
): FilterQuery<any> | null {
  if (!criteria.filter?.path)
    return null;

  return {
    "fileInfos.path": criteria.filter.path,
  };
}

export function getCriteriaPipeline(
  criteria: EpisodesCrudDtos.GetManyByCriteria.Criteria,
) {
  const filter = buildMongooseFilter(criteria);
  const fileInfoFilter = buildFileInfoFilter(criteria);
  const sort = buildMongooseSort(criteria);
  const needsFileInfoLookup = fileInfoFilter || criteria.expand?.includes("fileInfos");
  const pipeline: PipelineStage[] = [
    {
      $match: filter,
    },
  ];

  // Si necesitamos filtrar por fileInfo o expandir fileInfos,
  // hacemos el lookup ANTES de la paginación
  if (needsFileInfoLookup) {
    pipeline.push( {
      $lookup: {
        from: EpisodeFileInfoOdm.COLLECTION_NAME,
        localField: "_id",
        foreignField: "episodeId",
        as: "fileInfos",
      },
    } );

    // Si hay filtro por path, aplicarlo después del lookup
    if (fileInfoFilter) {
      pipeline.push( {
        $match: fileInfoFilter,
      } );
    }
  }

  if (sort) {
    pipeline.push( {
      $sort: sort,
    } );
  }

  // Aplicar paginación después de los filtros y lookups necesarios
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

  // Agregar lookups para expand (excepto fileInfos que ya se hizo si era necesario)
  if (criteria.expand) {
    if (criteria.expand.includes("series")) {
      pipeline.push( {
        $lookup: {
          from: "series", // nombre de la colección de series
          localField: "seriesKey",
          foreignField: "key",
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

    // Si necesitas expandir tanto series como fileInfos de las series
    if (criteria.expand.includes("series") && criteria.expand.includes("fileInfos")) {
      // Lookup para obtener fileInfos de la serie
      pipeline.push( {
        $lookup: {
          from: EpisodeFileInfoOdm.COLLECTION_NAME,
          localField: "serie._id",
          foreignField: "seriesKey",
          as: "serieFileInfos",
        },
      } );

      // Añadir los fileInfos a la serie
      pipeline.push( {
        $addFields: {
          "serie.fileInfos": "$serieFileInfos",
        },
      } );

      // Limpiar el campo temporal
      pipeline.push( {
        $unset: "serieFileInfos",
      } );
    }
  }

  return pipeline;
}
