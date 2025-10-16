import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { Injectable } from "@nestjs/common";
import { Types, PipelineStage } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicsSearchService } from "#modules/search/search-services/musics.search.service";
import { MusicsUsersOdm } from "../user-info/odm";
import { MusicOdm } from "./odm";
import { AggregationResult } from "./odm/criteria-pipeline";

type CriteriaMany = MusicCrudDtos.GetMany.Criteria;

@Injectable()
export class GetManyByCriteriaMusicRepoService {
  constructor(
    private readonly musicsSearchService: MusicsSearchService,
  ) {}

  async doAction(
    userId: string | null,
    criteria: CriteriaMany,
  ): Promise<any> {
    const normalizedCriteria = this.normalizeCriteria(criteria);
    const aggregationResult = await this.executeSearch(userId, normalizedCriteria);
    const docs = aggregationResult[0].data;

    if (!userId)
      this.addDefaultUserInfo(docs);

    this.validateExpands(normalizedCriteria, docs);

    return MusicOdm.toPaginatedResult(aggregationResult);
  }

  private normalizeCriteria(criteria: CriteriaMany): CriteriaMany {
    return {
      ...criteria,
      limit: criteria.limit ?? 10,
      filter: {
        ...criteria.filter,
        userInfoUserId: criteria.expand?.includes("userInfo")
          ? criteria.filter?.userInfoUserId ?? null
          : criteria.filter?.userInfoUserId,
      },
    };
  }

  private async executeSearch(
    userId: string | null,
    criteria: CriteriaMany,
  ): Promise<AggregationResult> {
    const hasFilters = criteria.filter && Object.entries(criteria.filter).length > 0;

    if (hasFilters)
      return await this.searchWithFilters(userId, criteria);
    else
      return await this.searchWithoutFilters(criteria);
  }

  private async searchWithFilters(
    userId: string | null,
    criteria: CriteriaMany,
  ): Promise<AggregationResult> {
    const searchQuery = Object.values(criteria.filter!).join(" ");
    const searchOptions = this.buildSearchOptions(criteria);
    const { data: docs, total } = await this.musicsSearchService.search(
      userId,
      searchQuery,
      searchOptions,
    );
    const musicIds = this.extractMusicIds(docs);
    const pipeline = this.buildPipelineWithFilters(userId, criteria, musicIds);
    const aggregationResult = await MusicOdm.Model.aggregate(pipeline) as AggregationResult;

    aggregationResult[0].metadata[0] = {
      totalCount: total,
    };

    return aggregationResult;
  }

  private async searchWithoutFilters(criteria: CriteriaMany): Promise<AggregationResult> {
    const pipeline = MusicOdm.getCriteriaPipeline(criteria);

    return await MusicOdm.Model.aggregate(pipeline) as AggregationResult;
  }

  private buildSearchOptions(criteria: CriteriaMany) {
    return {
      limit: criteria.limit,
      offset: criteria.offset,
      sort: this.mapSortFields(criteria.sort ?? {} ),
      showRankingScore: true,
    };
  }

  private mapSortFields(sort: Record<string, any>): string[] {
    return Object.entries(sort).map(([key, value]) => {
      const mappedKey = this.mapSortKey(key);

      return `${mappedKey}:${value}`;
    } );
  }

  private mapSortKey(key: string): string {
    const keyMapping: Record<string, string> = {
      added: "addedAt",
    };

    return keyMapping[key] ?? key;
  }

  private extractMusicIds(docs: any[]): { stringIds: string[];
objectIds: Types.ObjectId[]; } {
    return {
      stringIds: docs.map(hit => hit.musicId),
      objectIds: docs.map(hit => new Types.ObjectId(hit.musicId)),
    };
  }

  private buildPipelineWithFilters(
    userId: string | null,
    criteria: CriteriaMany,
    musicIds: { stringIds: string[];
objectIds: Types.ObjectId[]; },
  ): PipelineStage[] {
    const { filter, sort, offset, limit, ...criteriaSearch } = criteria;
    let pipeline = MusicOdm.getCriteriaPipeline(criteriaSearch);
    const lastStage = pipeline[pipeline.length - 1];

    pipeline = this.addMatchStage(pipeline, musicIds.objectIds);
    pipeline = this.addCustomSortingStage(pipeline, musicIds.stringIds);
    pipeline = this.addUserInfoLookupIfNeeded(pipeline, userId, criteria, lastStage);

    return pipeline;
  }

  private addMatchStage(
    pipeline: PipelineStage[],
    musicObjectIds: Types.ObjectId[],
  ): PipelineStage[] {
    return [
      {
        $match: {
          _id: {
            $in: musicObjectIds,
          },
        },
      },
      ...pipeline.slice(0, -1),
    ];
  }

  private addCustomSortingStage(
    pipeline: PipelineStage[],
    musicStringIds: string[],
  ): PipelineStage[] {
    return [
      ...pipeline,
      {
        $addFields: {
          __sortIndex: {
            $indexOfArray: [musicStringIds, {
              $toString: "$_id",
            }],
          },
        },
      },
      {
        $sort: {
          __sortIndex: 1,
        },
      },
      {
        $unset: "__sortIndex",
      },
    ];
  }

  private addUserInfoLookupIfNeeded(
    pipeline: PipelineStage[],
    userId: string | null,
    criteria: CriteriaMany,
    lastStage: PipelineStage,
  ): PipelineStage[] {
    const needsUserInfo = userId && criteria?.expand?.includes("userInfo");

    if (needsUserInfo)
      return addUserInfoLookupToPipeline([...pipeline, lastStage]);

    return [...pipeline, lastStage];
  }

  private addDefaultUserInfo(docs: any[]): void {
    const id = new Types.ObjectId();
    const defaultUserInfo: Omit<MusicsUsersOdm.FullDoc, "musicId"> = {
      _id: id,
      lastTimePlayed: 0,
      weight: 0,
      userId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    for (const doc of docs) {
      doc.userInfo = {
        ...defaultUserInfo,
        musicId: doc._id,
      };
    }
  }

  private validateExpands(criteria: CriteriaMany, docs: any[]): void {
    if (docs.length === 0)
      return;

    if (criteria?.expand?.includes("fileInfos"))
      assertIsDefined(docs[0].fileInfos, "Lookup file infos failed");

    if (criteria?.expand?.includes("userInfo"))
      assertIsDefined(docs[0].userInfo, "Lookup userInfo failed");
  }
}

function addUserInfoLookupToPipeline(pipeline: any[]) {
  // Insertar antes del último stage (que suele ser $facet)
  const lastStage = pipeline.pop();

  pipeline.push( {
    $lookup: {
      from: "musics_users",
      let: {
        musicId: "$_id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$musicId", "$$musicId"],
            },
          },
        },
      ],
      as: "userInfoArray",
    },
  } );

  pipeline.push( {
    $addFields: {
      userInfo: {
        $arrayElemAt: ["$userInfoArray", 0],
      },
    },
  } );

  pipeline.push( {
    $unset: "userInfoArray",
  } );

  if (lastStage)
    pipeline.push(lastStage);

  return pipeline;
}
