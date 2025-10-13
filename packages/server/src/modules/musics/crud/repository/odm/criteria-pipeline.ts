import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { MongoFilterQuery } from "#utils/layers/db/mongoose";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { FullDocOdm } from "./odm";

type Criteria = MusicCrudDtos.GetMany.Criteria;

function buildMongooseSort(
  body: Criteria,
): Record<string, -1 | 1> | undefined {
  if (!body.sort)
    return undefined;

  const { added, artist, updated } = body.sort;

  if (!added && !artist && !updated)
    return undefined;

  const ret: Record<string, -1 | 1> | undefined = {};

  if (added)
    ret["timestamps.addedAt"] = added === "asc" ? 1 : -1;

  if (updated)
    ret["timestamps.updatedAt"] = updated === "asc" ? 1 : -1;

  if (artist)
    ret["artist"] = artist === "asc" ? 1 : -1;

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
  // Si necesitamos filtrar por hash o path, hacer lookup primero
  const needsFileInfoLookup = criteria.expand?.includes("fileInfos")
                             || !!criteria.filter?.hash
                             || !!criteria.filter?.path;
  const needsUserInfoLookup = criteria.expand?.includes("userInfo");
  // Construir filtro después del lookup si es necesario
  const filter = buildMongooseFilterWithFileInfos(criteria, needsFileInfoLookup);

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

  // Lookups después de la paginación
  if (needsFileInfoLookup) {
    dataPipeline.push( {
      $lookup: {
        from: MusicFileInfoOdm.COLLECTION_NAME,
        localField: "_id",
        foreignField: "musicId",
        as: "fileInfos",
      },
    } );
  }

  if (needsUserInfoLookup) {
    dataPipeline.push( {
      $lookup: {
        from: "users", // Ajusta el nombre de la colección según tu esquema
        localField: "userId", // Ajusta el campo según tu esquema
        foreignField: "_id",
        as: "userInfo",
      },
    } );

    // Convertir el array en un objeto único (asumiendo relación 1:1)
    dataPipeline.push( {
      $unwind: {
        path: "$userInfo",
        preserveNullAndEmptyArrays: true,
      },
    } );
  }

  // Asignar el pipeline de datos al facet
  (facetStage.$facet as any).data = dataPipeline;

  pipeline.push(facetStage);

  return pipeline;
}

function buildMongooseFilterWithFileInfos(
  criteria: MusicCrudDtos.GetMany.Criteria,
  hasFileInfoLookup: boolean,
): FilterQuery<any> {
  const filter: MongoFilterQuery<any> = {};

  if (criteria.filter) {
    if (criteria.filter.title) {
      filter["title"] = {
        $regex: criteria.filter.title,
        $options: "i",
      };
    }

    if (criteria.filter.artist) {
      filter["artist"] = {
        $regex: criteria.filter.artist,
        $options: "i",
      };
    }

    if (criteria.filter.id)
      filter["_id"] = new Types.ObjectId(criteria.filter.id);

    if (criteria.filter.slug)
      filter["url"] = criteria.filter.slug;

    // Solo aplicar estos filtros si tenemos el lookup
    if (hasFileInfoLookup) {
      if (criteria.filter.hash)
        filter["fileInfos.hash"] = criteria.filter.hash;

      if (criteria.filter.path)
        filter["fileInfos.path"] = criteria.filter.path;
    }
  }

  return filter;
}
