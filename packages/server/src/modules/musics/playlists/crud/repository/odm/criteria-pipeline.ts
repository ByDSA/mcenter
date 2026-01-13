import { Types, type FilterQuery, type PipelineStage } from "mongoose";
import { MongoFilterQuery } from "#utils/layers/db/mongoose";
import { MusicPlaylistCrudDtos } from "#musics/playlists/models/dto";
import { MusicExpansionFlags, enrichMusicList } from "#musics/crud/repositories/music/odm/pipeline-utils";
import { enrichImageCover } from "#modules/image-covers/repositories/odm/utils";
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

// ... type AggregationResult ...
export function getCriteriaPipeline(criteria: Criteria) {
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [];
  const requestUserId = criteria.filter?.requestUserId || null;
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

  // Lógica de expansión usando la utilidad compartida
  if (criteria.expand?.includes("musics")) {
    const flags: MusicExpansionFlags = {
      // eslint-disable-next-line daproj/max-len
      // En playlists, fileInfos suele ir implícito si se piden músicas, o puedes agregar un flag especifico
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
