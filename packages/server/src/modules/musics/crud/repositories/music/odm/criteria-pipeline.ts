import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { DocOdm } from "./odm";
import { enrichSingleMusic, MusicExpansionFlags } from "./pipeline-utils";

type Criteria = MusicCrudDtos.GetMany.Criteria;

function buildMongooseSort(body: Criteria): Record<string, -1 | 1> | undefined {
  if (!body.sort)
    return undefined;

  const { added, artist, updated } = body.sort;

  if (!added && !artist && !updated)
    return undefined;

  const ret: MongoSortQuery<DocOdm> = {};

  if (added)
    ret["addedAt"] = added === "asc" ? 1 : -1;

  if (updated)
    ret["updatedAt"] = updated === "asc" ? 1 : -1;

  if (artist)
    ret["artist"] = artist === "asc" ? 1 : -1;

  if (Object.keys(ret).length > 0)
    ret["_id"] = 1;

  return ret;
}

// ... type AggregationResult ...
export function getCriteriaPipeline(
  userId: string | null,
  criteria: Criteria,
) {
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [];
  // Flags de expansión
  const expansionFlags: MusicExpansionFlags = {
    includeFileInfos: criteria.expand?.includes("fileInfos")
                      || !!criteria.filter?.hash
                      || !!criteria.filter?.path,
    includeUserInfo: criteria.expand?.includes("userInfo"),
    includeFavorite: criteria.expand?.includes("favorite"),
  };
  // NOTA: Para filtrar por campos dentro de los lookups (hash, path),
  // necesitamos hacer el lookup de fileInfos *antes* del match si se filtra por ellos,
  // O podemos mantener la lógica original de filtrar por propiedades "virtuales" después.
  // eslint-disable-next-line daproj/max-len
  // En tu código original, construías el filtro asumiendo que el campo ya existe si el flag está activo.
  // Sin embargo, para eficiencia, los lookups pesados suelen ir después del paginado si es posible.
  // Dado que has/path son filtros, DEBEN ir antes del match.
  // Si necesitamos filtrar por hash/path, forzamos el lookup al inicio
  const preFilterEnrichment = !!criteria.filter?.hash || !!criteria.filter?.path;

  if (preFilterEnrichment) {
    pipeline.push(...enrichSingleMusic("_id", null, userId, {
      includeFileInfos: true,
      // Solo cargamos lo necesario para filtrar
      includeUserInfo: false,
      includeFavorite: false,
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

  // Sort y Paginación
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

  // Enrich Restante (UserInfo, Favorites, y FileInfos si no se cargó antes)
  // Calculamos qué falta por cargar
  const postPaginationFlags: MusicExpansionFlags = {
    includeFileInfos: expansionFlags.includeFileInfos && !preFilterEnrichment,
    includeUserInfo: expansionFlags.includeUserInfo,
    includeFavorite: expansionFlags.includeFavorite,
  };

  dataPipeline.push(...enrichSingleMusic("_id", null, userId, postPaginationFlags));

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

    if (hasFileInfoLookup) {
      if (criteria.filter.hash)
        filter["fileInfos.hash"] = criteria.filter.hash;

      if (criteria.filter.path)
        filter["fileInfos.path"] = criteria.filter.path;
    }
  }

  return filter;
}
