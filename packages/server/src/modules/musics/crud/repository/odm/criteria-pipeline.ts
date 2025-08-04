import type { FilterQuery, PipelineStage } from "mongoose";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { MongoFilterQuery } from "#utils/layers/db/mongoose";

type Criteria = MusicCrudDtos.GetMany.Criteria;

function buildMongooseSort(
  body: Criteria,
): Record<string, -1 | 1> | undefined {
  if (!body.sort?.episodeKey)
    return undefined;

  return {
    "date.timestamp": body.sort.episodeKey === "asc" ? 1 : -1,
  };
}

export function getCriteriaPipeline(
  criteria: Criteria,
) {
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [];
  // Si necesitamos filtrar por hash o path, hacer lookup primero
  const needsFileInfoLookup = criteria.expand?.includes("fileInfos")
                             || !!criteria.filter?.hash
                             || !!criteria.filter?.path;

  if (needsFileInfoLookup) {
    pipeline.push( {
      $lookup: {
        from: "musicfileinfos",
        localField: "_id",
        foreignField: "musicId",
        as: "fileInfos",
      },
    } );
  }

  // Construir filtro después del lookup si es necesario
  const filter = buildMongooseFilterWithFileInfos(criteria, needsFileInfoLookup);

  if (Object.keys(filter).length > 0) {
    pipeline.push( {
      $match: filter,
    } );
  }

  // Sort después del lookup y match
  if (sort) {
    pipeline.push( {
      $sort: sort,
    } );
  }

  // Pagination al final
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

function buildMongooseFilterWithFileInfos(
  criteria: MusicCrudDtos.GetMany.Criteria,
  hasFileInfoLookup: boolean,
): FilterQuery<any> {
  const filter: MongoFilterQuery<any> = {};

  if (criteria.filter) {
    if (criteria.filter.id)
      filter["_id"] = criteria.filter.id;

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
