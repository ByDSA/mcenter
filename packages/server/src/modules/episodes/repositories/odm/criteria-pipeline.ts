import type { EpisodesRestDtos } from "$shared/models/episodes/dto/transport";
import type { FilterQuery, PipelineStage } from "mongoose";
import { DocOdm as EpisodeDocOdm } from "./odm";

// Asumiendo que tienes un ODM para Episode
function buildMongooseSort(
  body: EpisodesRestDtos.GetManyByCriteria.Criteria,
): Record<string, -1 | 1> | undefined {
  if (!body.sort)
    return undefined;

  const sortObj: Record<string, -1 | 1> = {};

  // Ejemplo de ordenación por diferentes campos
  // TODO: cambiar cuando db
  if (body.sort.episodeCompKey) {
    sortObj["serieId"] = body.sort.episodeCompKey === "asc" ? 1 : -1;
    sortObj["episodeId"] = body.sort.episodeCompKey === "asc" ? 1 : -1;
  }

  if (body.sort.createdAt)
    sortObj["timestamps.createdAt"] = body.sort.createdAt === "asc" ? 1 : -1;

  if (body.sort.updatedAt)
    sortObj["timestamps.updatedAt"] = body.sort.updatedAt === "asc" ? 1 : -1;

  return Object.keys(sortObj).length > 0 ? sortObj : undefined;
}

function buildMongooseFilter(
  criteria: EpisodesRestDtos.GetManyByCriteria.Criteria,
): FilterQuery<EpisodeDocOdm> {
  const filter: FilterQuery<EpisodeDocOdm> = {};

  if (criteria.filter) {
    if (criteria.filter.seriesKey)
      filter["serieId"] = criteria.filter.seriesKey;

    if (criteria.filter.episodeKey)
      filter["episodeId"] = criteria.filter.episodeKey;

    if (
      criteria.filter.episodeKeys && criteria.filter.episodeKeys.length > 0
    ) {
      filter["episodeId"] = {
        $in: criteria.filter.episodeKeys,
      };
    }

    if (criteria.filter.seriesKeys && criteria.filter.seriesKeys.length > 0) {
      filter["serieId"] = {
        $in: criteria.filter.seriesKeys,
      };
    }

    // No incluimos el filtro de path aquí porque necesita el lookup primero
  }

  return filter;
}

function buildFileInfoFilter(
  criteria: EpisodesRestDtos.GetManyByCriteria.Criteria,
): FilterQuery<any> | null {
  if (!criteria.filter?.path)
    return null;

  return {
    "fileInfos.path": criteria.filter.path,
  };
}

export function getCriteriaPipeline(
  criteria: EpisodesRestDtos.GetManyByCriteria.Criteria,
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
        from: "episodefileinfos",
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
          localField: "serieId",
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

    // Si necesitas expandir tanto series como fileInfos de las series
    if (criteria.expand.includes("series") && criteria.expand.includes("fileInfos")) {
      // Lookup para obtener fileInfos de la serie
      pipeline.push( {
        $lookup: {
          from: "seriefileinfos",
          localField: "serie._id",
          foreignField: "serieId",
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
