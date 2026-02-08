import type { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { enrichImageCover } from "#modules/image-covers/crud/repositories/odm/utils";
import { EpisodesUsersOdm } from "../../user-infos/odm";
import { DocOdm } from "./odm";

// Definimos flags similares a MusicExpansionFlags
export interface EpisodeExpansionFlags {
  includeFileInfos: boolean;
  includeUserInfo: boolean;
  includeSeries: boolean;
  includeSeriesImageCover: boolean;
}

type Criteria = EpisodesCrudDtos.GetMany.Criteria;

function buildMongooseSort(body: Criteria): Record<string, -1 | 1> | undefined {
  if (!body.sort)
    return undefined;

  const ret: MongoSortQuery<DocOdm> = {};

  if (body.sort.episodeCompKey) {
    // Orden compuesto
    ret["seriesId"] = body.sort.episodeCompKey === "asc" ? 1 : -1;
    ret["episodeKey"] = body.sort.episodeCompKey === "asc" ? 1 : -1;
  } else if (body.sort.episodeKey)
    ret["episodeKey"] = body.sort.episodeKey === "asc" ? 1 : -1;

  if (body.sort.createdAt)
    ret["createdAt"] = body.sort.createdAt === "asc" ? 1 : -1;

  if (body.sort.updatedAt)
    ret["updatedAt"] = body.sort.updatedAt === "asc" ? 1 : -1;

  // Tie-breaker para paginación consistente
  if (Object.keys(ret).length > 0)
    ret["_id"] = 1;

  return ret as Record<string, -1 | 1>;
}

/**
 * Función helper equivalente a enrichSingleMusic pero para Episodes.
 * Maneja los Lookups complejos.
 */
export function enrichSingleEpisode(
  _localField: string,
  targetField: string | null,
  userId: string | null | undefined,
  flags: EpisodeExpansionFlags,
): PipelineStage[] {
  const pipeline: PipelineStage[] = [];
  const rootPrefix = targetField ? `${targetField}.` : "";

  // 1. File Infos
  if (flags.includeFileInfos) {
    pipeline.push( {
      $lookup: {
        from: EpisodeFileInfoOdm.COLLECTION_NAME,
        localField: `${rootPrefix}_id`,
        foreignField: "episodeId",
        as: `${rootPrefix}fileInfos`,
      },
    } );
  }

  // 2. User Info
  if (flags.includeUserInfo && userId) {
    pipeline.push( {
      $lookup: {
        from: EpisodesUsersOdm.COLLECTION_NAME,
        let: {
          episodeId: targetField ? `$${targetField}._id` : "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$episodeId", "$$episodeId"],
                  },
                  {
                    $eq: ["$userId", new Types.ObjectId(userId)],
                  },
                ],
              },
            },
          },
          {
            $limit: 1,
          }, // Solo 1 registro por usuario/episodio
        ],
        as: `${rootPrefix}userInfo`,
      },
    } );

    // Unwind para tener un objeto en lugar de array
    pipeline.push( {
      $addFields: {
        [`${rootPrefix}userInfo`]: {
          $arrayElemAt: [`$${rootPrefix}userInfo`, 0],
        },
      },
    } );
  }

  // 3. Series
  if (flags.includeSeries || flags.includeSeriesImageCover) {
    pipeline.push( {
      $lookup: {
        from: SeriesOdm.COLLECTION_NAME,
        localField: `${rootPrefix}seriesId`,
        foreignField: "_id",
        as: `${rootPrefix}series`,
      },
    } );

    pipeline.push( {
      $addFields: {
        [`${rootPrefix}series`]: {
          $arrayElemAt: [`$${rootPrefix}series`, 0],
        },
      },
    } );

    if (flags.includeSeriesImageCover) {
      pipeline.push(...enrichImageCover( {
        imageCoverField: `${rootPrefix}series.imageCover`,
        imageCoverIdField: `${rootPrefix}series.imageCoverId`,
      } ));
    }

    if (flags.includeFileInfos) {
      pipeline.push( {
        $lookup: {
          from: EpisodeFileInfoOdm.COLLECTION_NAME,
          localField: `${rootPrefix}series._id`, // ID de la serie recién poblada
          foreignField: "seriesId", // Asumiendo relación en FileInfos
          as: "seriesFileInfosTemp",
        },
      } );

      pipeline.push( {
        $addFields: {
          [`${rootPrefix}series.fileInfos`]: "$seriesFileInfosTemp",
        },
      } );

      pipeline.push( {
        $unset: "seriesFileInfosTemp",
      } );
    }
  }

  return pipeline;
}

export function getCriteriaPipeline(
  userId: string | null | undefined = null,
  criteria: Criteria,
) {
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [];
  // Flags de expansión
  const expansionFlags: EpisodeExpansionFlags = {
    includeFileInfos: criteria.expand?.includes("fileInfos")
                      || !!criteria.filter?.path, // Necesario si filtramos por path
    includeUserInfo: criteria.expand?.includes("userInfo") ?? false,
    includeSeries: criteria.expand?.includes("series") ?? false,
    includeSeriesImageCover: criteria.expand?.includes("seriesImageCover") ?? false,
  };
  // Pre-filter: Si filtramos por 'path', necesitamos 'fileInfos' ANTES del match
  const preFilterEnrichment = !!criteria.filter?.path;

  if (preFilterEnrichment) {
    pipeline.push(...enrichSingleEpisode("_id", null, userId, {
      includeFileInfos: true, // Forzamos carga
      includeUserInfo: false,
      includeSeries: false,
      includeSeriesImageCover: false,
    } ));
  }

  // Filtros
  const filter = buildMongooseFilterWithFileInfos(criteria, preFilterEnrichment);

  if (Object.keys(filter).length > 0) {
    pipeline.push( {
      $match: filter,
    } );
  }

  // Facet para data y metadatos
  const facetStage: PipelineStage = {
    $facet: {
      data: [],
      metadata: [{
        $count: "totalCount",
      }],
    },
  };
  const dataPipeline: PipelineStage[] = [];

  // Sort, Skip, Limit (Dentro de 'data')
  if (sort) {
    dataPipeline.push( {
      $sort: sort,
    } );
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

  // Enrich Restante (UserInfo, Series, y FileInfos si no se cargó antes)
  const postPaginationFlags: EpisodeExpansionFlags = {
    includeFileInfos: expansionFlags.includeFileInfos && !preFilterEnrichment,
    includeUserInfo: expansionFlags.includeUserInfo,
    includeSeries: expansionFlags.includeSeries,
    includeSeriesImageCover: expansionFlags.includeSeriesImageCover,
  };

  dataPipeline.push(...enrichSingleEpisode("_id", null, userId, postPaginationFlags));

  (facetStage.$facet as any).data = dataPipeline;
  pipeline.push(facetStage);

  return pipeline;
}

function buildMongooseFilterWithFileInfos(
  criteria: Criteria,
  hasFileInfoLookup: boolean,
): FilterQuery<any> {
  const filter: MongoFilterQuery<any> = {};

  if (criteria.filter) {
    if (criteria.filter.id)
      filter["_id"] = new Types.ObjectId(criteria.filter.id);

    if (criteria.filter.ids) {
      filter["_id"] = {
        $in: criteria.filter.ids.map(id => new Types.ObjectId(id)),
      };
    }

    if (criteria.filter.seriesId)
      filter["seriesId"] = new Types.ObjectId(criteria.filter.seriesId);

    if (criteria.filter.episodeKey)
      filter["episodeKey"] = criteria.filter.episodeKey;

    if (criteria.filter.episodeKeys && criteria.filter.episodeKeys.length > 0) {
      filter["episodeKey"] = {
        $in: criteria.filter.episodeKeys,
      };
    }

    if (criteria.filter.seriesIds && criteria.filter.seriesIds.length > 0) {
      filter["seriesId"] = {
        $in: criteria.filter.seriesIds.map(id => new Types.ObjectId(id)),
      };
    }

    // Filtro por path (solo funciona si hasFileInfoLookup es true)
    if (hasFileInfoLookup && criteria.filter.path)
      filter["fileInfos.path"] = criteria.filter.path;
  }

  return filter;
}
