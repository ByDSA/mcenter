import type { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import { Types, type PipelineStage } from "mongoose";
import { WithRequired } from "$shared/utils/objects";
import { assertIsDefined } from "$shared/utils/validation";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { assertFoundClient } from "#utils/validation/found";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { enrichSingleEpisode } from "#episodes/crud/repositories/episodes/odm/criteria-pipeline";
import { DocOdm, FullDocOdm } from "./odm/odm";

function buildMongooseSort(
  body: EpisodeHistoryEntryCrudDtos.GetMany.Criteria,
): MongoSortQuery<DocOdm> | undefined {
  if (!body.sort?.timestamp)
    return undefined;

  return {
    date: body.sort.timestamp === "asc" ? 1 : -1,
  };
}

function buildMongooseFilter(
  criteria: EpisodeHistoryEntryCrudDtos.GetMany.Criteria,
): MongoFilterQuery<DocOdm> {
  const filter: MongoFilterQuery<WithRequired<FullDocOdm, "episode"> & {
    episode: {
      series: NonNullable<Required<FullDocOdm>["episode"]["series"]>;
    };
  }> = {};
  const userIdStr = criteria.filter?.userId;

  assertIsDefined(userIdStr);

  filter.userId = new Types.ObjectId(userIdStr);

  if (criteria.filter) {
    if (criteria.filter.seriesId) {
      assertFoundClient(
        criteria.expand?.includes("episodes"),
        "Lookup episodes is required to filter by seriesId",
      );
      filter["episode.seriesId"] = new Types.ObjectId(criteria.filter.seriesId);
    }

    if (criteria.filter.episodeKey) {
      assertFoundClient(
        criteria.expand?.includes("episodes"),
        "Lookup episodes is required to filter by episodeKey",
      );
      filter["episode.episodeKey"] = criteria.filter.episodeKey;
    }

    if (criteria.filter.episodeId)
      filter["episodeId"] = new Types.ObjectId(criteria.filter.episodeId);

    if (criteria.filter.timestampMax !== undefined) {
      filter["date"] = {
        $lte: new Date(criteria.filter.timestampMax * 1000),
      };
    }
  }

  return filter;
}

export function getCriteriaPipeline(
  criteria: EpisodeHistoryEntryCrudDtos.GetMany.Criteria,
) {
  if (criteria.limit !== undefined && criteria.limit < 1) {
    return [{
      $match: {
        _id: null,
      },
    }];
  }

  const filter = buildMongooseFilter(criteria);
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [];
  const needsEpisodeLookupEarly = criteria.filter?.episodeKey || criteria.filter?.seriesId;
  const needsEpisodeLookup = criteria.expand?.includes("episodes")
  || criteria.expand?.includes("episodesFileInfos")
  || criteria.expand?.includes("episodesUserInfo")
  || criteria.expand?.includes("episodesSeries")
  || criteria.expand?.includes("episodesSeriesImageCover");

  // 1. Lookup de episode ANTES del match si necesitamos filtrar por sus campos
  if (needsEpisodeLookupEarly && needsEpisodeLookup) {
    pipeline.push( {
      $lookup: {
        from: EpisodeOdm.COLLECTION_NAME,
        localField: "episodeId",
        foreignField: "_id",
        as: "episode",
      },
    } );

    pipeline.push( {
      $addFields: {
        episode: {
          $arrayElemAt: ["$episode", 0],
        },
      },
    } );
  }

  // 2. Match (ahora puede filtrar por episode.episodeKey o episode.seriesId si aplica)
  pipeline.push( {
    $match: filter,
  } );

  // 3. Sort, skip, limit
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

  // 4. Lookup de episode DESPUÉS de paginación si no se hizo antes
  if (needsEpisodeLookup && !needsEpisodeLookupEarly) {
    pipeline.push( {
      $lookup: {
        from: EpisodeOdm.COLLECTION_NAME,
        localField: "episodeId",
        foreignField: "_id",
        as: "episode",
      },
    } );

    pipeline.push( {
      $addFields: {
        episode: {
          $arrayElemAt: ["$episode", 0],
        },
      },
    } );
  }

  if (needsEpisodeLookup) {
    const episodeEnrichFlags = {
      includeFileInfos: criteria.expand!.includes("episodesFileInfos"),
      includeUserInfo: criteria.expand!.includes("episodesUserInfo"),
      includeSeries: criteria.expand!.includes("episodesSeries"),
      includeSeriesImageCover: criteria.expand!.includes("episodesSeriesImageCover"),
    };

    // Usar enrichSingleEpisode apuntando al campo "episode"
    pipeline.push(
      ...enrichSingleEpisode("episodeId", "episode", criteria.filter?.userId, episodeEnrichFlags),
    );
  }

  return pipeline;
}
