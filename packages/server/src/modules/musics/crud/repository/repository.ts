import { forwardRef, Inject, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { Types, UpdateQuery } from "mongoose";
import { MusicFileInfoEntity, MusicFileInfoOmitMusicId } from "$shared/models/musics/file-info";
import { assertFoundClient } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetManyByCriteria, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { MusicEntity, Music, MusicId, MusicEntityWithUserInfo } from "#musics/models";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { showError } from "#core/logging/show-error";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicFileInfoRepository } from "#musics/file-info/crud/repository";
import { MusicsSearchService } from "#modules/search/search-services/musics.search.service";
import { MusicAvailableSlugGeneratorService } from "../builder/vailable-slug-generator.service";
import { MusicBuilderService } from "../builder/music-builder.service";
import { MusicHistoryEntryEvents } from "../../history/crud/repository/events";
import { expressionToMeilisearchQuery } from "./queries/queries-meili";
import { AggregationResult } from "./odm/criteria-pipeline";
import { MusicOdm } from "./odm";
import { MusicEvents } from "./events";
import { ExpressionNode } from "./queries/query-object";

type CriteriaOne = MusicCrudDtos.GetOne.Criteria;
type CriteriaMany = MusicCrudDtos.GetMany.Criteria;

type PatchOptions = {
  userId?: string;
};

@Injectable()
export class MusicsRepository
implements
CanPatchOneByIdAndGet<MusicEntity, MusicId, Music, PatchOptions>,
CanGetOneById<MusicEntity, MusicId>,
CanDeleteOneByIdAndGet<MusicEntity, MusicEntity["id"]>,
CanGetManyByCriteria<MusicEntity, CriteriaMany> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    @Inject(forwardRef(()=>MusicAvailableSlugGeneratorService))
    private readonly slugGenerator: MusicAvailableSlugGeneratorService,
    private readonly musicBuilder: MusicBuilderService,
    private readonly fileInfoRepo: MusicFileInfoRepository,
    private readonly musicsSearchService: MusicsSearchService,
  ) { }

  @OnEvent(MusicEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(MusicHistoryEntryEvents.Created.TYPE)
  async handleCreateHistoryEntryEvents(event: MusicHistoryEntryEvents.Created.Event) {
    const { entity } = event.payload;

    await this.patchOneByIdAndGet(entity.resourceId, {
      entity: {
        lastTimePlayed: entity.date.timestamp,
      },
    }, {
      userId: event.payload.entity.userId,
    } ).catch(showError);
  }

  async deleteOneByIdAndGet(id: string): Promise<MusicEntity> {
    const doc = await MusicOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    const ret = MusicOdm.toEntity(doc);

    this.domainEventEmitter.emitEntity(MusicEvents.Deleted.TYPE, ret);

    return ret;
  }

  async getOneById(id: string): Promise<MusicEntity | null> {
    const doc = await MusicOdm.Model.findById(id);

    assertFoundClient(doc);

    return MusicOdm.toEntity(doc);
  }

  async getManyByCriteria(criteria: CriteriaMany): Promise<any> {
    const actualCriteria: CriteriaMany = {
      ...criteria,
      limit: criteria.limit ?? 10,
    };
    let aggregationResult: AggregationResult;

    if (criteria.filter && Object.entries(criteria.filter).length > 0) {
      const { data: docs,
        total } = await this.musicsSearchService.search(Object.values(criteria.filter).join(" "), {
        limit: actualCriteria.limit,
        offset: actualCriteria.offset,
        sort: Object.entries(actualCriteria.sort ?? {} ).map(([key, value])=> {
          const fixedKey = (()=> {
            switch (key) {
              case "added": return "addedAt";
              default: return key;
            }
          } )();

          return fixedKey + ":" + value;
        } ),
        showRankingScore: true,
      } );
      const musicStringIds = docs.map(hit => hit.id);
      const musicObjectIds = docs.map(hit => new Types.ObjectId(hit.id));
      const { filter, sort, offset, limit, ...criteriaSearch } = actualCriteria;
      let pipeline = MusicOdm.getCriteriaPipeline(criteriaSearch);

      pipeline = [
        {
          $match: {
            _id: {
              $in: musicObjectIds,
            },
          },
        },
        ...pipeline.slice(0, -1),
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
        ...pipeline.slice(-1),
      ];

      aggregationResult = await MusicOdm.Model.aggregate(pipeline) as AggregationResult;
      aggregationResult[0].metadata[0] = {
        totalCount: total,
      };
    } else {
      const pipeline = MusicOdm.getCriteriaPipeline(actualCriteria);

      aggregationResult = await MusicOdm.Model.aggregate(pipeline) as AggregationResult;
    }

    const docs = aggregationResult[0].data;

    if (docs.length > 0) {
      if (actualCriteria?.expand?.includes("fileInfos"))
        assertIsDefined(docs[0].fileInfos, "Lookup file infos failed");
    }

    return MusicOdm.toPaginatedResult(aggregationResult);
  }

  async patchOneByIdAndGet(
    id: MusicId,
    params: PatchOneParams<Omit<MusicEntityWithUserInfo, "id">>,
    opts: PatchOptions,
  ): Promise<MusicEntity> {
    const { entity: paramEntity } = params;
    let { timestamps: _, ...validEntity } = this.musicBuilder.fixFields(paramEntity);
    const updateQuery = patchParamsToUpdateQuery( {
      ...params,
      entity: validEntity,
    }, MusicOdm.partialToDoc);

    updateQuery.$set = {
      ...updateQuery.$set,
      "timestamps.updatedAt": new Date(),
    };

    const doc = await MusicOdm.Model.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    )
      .catch(e=>this.handleUpdateError(e, id, updateQuery));

    assertFoundClient(doc);

    const ret = MusicOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(MusicEvents.Patched.TYPE, {
      entity: validEntity,
      id,
      unset: params.unset,
    } );

    return ret;
  }

  async getOne(criteria: CriteriaOne): Promise<MusicEntity | null> {
    const pipeline = MusicOdm.getCriteriaPipeline(criteria);

    if (pipeline.length === 0)
      throw new UnprocessableEntityException(criteria);

    const aggreationResult = await MusicOdm.Model.aggregate(pipeline) as AggregationResult;
    const docs = aggreationResult[0].data;

    if (docs.length === 0)
      return null;

    const doc = docs[0];

    if (criteria?.expand?.includes("fileInfos"))
      assertIsDefined(doc.fileInfos, "Lookup file infos failed");

    return MusicOdm.toEntity(doc);
  }

  async getOneByHash(hash: string, criteria?: CriteriaOne): Promise<MusicEntity | null> {
    return await this.getOneByFilter( {
      hash,
    }, criteria);
  }

  async getOneBySlug(slug: string, criteria?: CriteriaOne): Promise<MusicEntity | null> {
    return await this.getOneByFilter( {
      slug,
    }, criteria);
  }

  async getAll(): Promise<MusicEntity[]> {
    const docs = await MusicOdm.Model.find( {} );
    const ret = docs.map(MusicOdm.toEntity);

    return ret;
  }

  async getManyByQuery(params: ExpressionNode): Promise<MusicEntity[]> {
    const query = expressionToMeilisearchQuery(params);
    const meiliRet = await this.musicsSearchService.filter(query, {
      limit: 0,
    } );
    const meiliDocs = meiliRet.data;

    if (meiliDocs.length === 0)
      return [];

    const ids = meiliDocs.map(doc => doc.id);
    // Nota: no tiene por qué respetarse el orden de los meiliDocs
    const docs = await MusicOdm.Model.find( {
      _id: {
        $in: ids,
      },
    } );
    const ret = docs.map(MusicOdm.toEntity);

    return ret;
  }

  private async getOneByFilter(filter: CriteriaOne["filter"], criteria?: CriteriaOne) {
    return await this.getOne( {
      ...criteria,
      filter: {
        ...criteria?.filter,
        ...filter,
      },
    } );
  }

  async createOneFromPath(
    relativePath: string,
    localFileMusic?: Partial<MusicFileInfoOmitMusicId>,
  ): Promise<{music: MusicEntity;
fileInfo: MusicFileInfoEntity;}> {
    const musicDto = await this.musicBuilder.createMusicFromFile(relativePath);
    const music = await this.createOneAndGet(musicDto);
    let fileInfo: MusicFileInfoEntity;

    try {
      fileInfo = await this.fileInfoRepo.upsertOneByPathAndGet(relativePath, {
        ...localFileMusic,
        musicId: music.id,
      } );
    } catch (e) {
      await this.deleteOneByIdAndGet(music.id);
      throw e;
    }

    return {
      music,
      fileInfo,
    };
  }

  private async handleUpdateError(
    e: unknown,
    id: string,
    updateQuery: UpdateQuery<MusicOdm.Doc>,
  ): Promise<MusicOdm.FullDoc | null> {
    if (isDuplicateKeyError(e)) {
      const fixedUpdateQuery: UpdateQuery<MusicOdm.Doc> = {
        ...updateQuery,
        url: await this.slugGenerator.getAvailableSlugFromSlug(updateQuery.url),
      };

      return MusicOdm.Model.findByIdAndUpdate(
        id,
        fixedUpdateQuery,
        {
          new: true,
        },
      );
    }

    throw e;
  }

  private async handleCreateError(e: unknown, doc: MusicOdm.Doc): Promise<MusicOdm.FullDoc> {
    if (isDuplicateKeyError(e)) {
      const fixedDoc: MusicOdm.Doc = {
        ...doc,
        url: await this.slugGenerator.getAvailableSlugFromSlug(doc.url),
      };

      return MusicOdm.Model.create(fixedDoc);
    }

    throw e;
  }

  @EmitEntityEvent(MusicEvents.Created.TYPE)
  async createOneAndGet(music: Music): Promise<MusicEntity> {
    const validMusic = this.musicBuilder.fixFields(music);
    const docOdm = MusicOdm.toDoc(validMusic);
    const gotDoc = await MusicOdm.Model.create(docOdm)
      .catch(e=>this.handleCreateError(e, docOdm));

    return MusicOdm.toEntity(gotDoc);
  }

  @EmitEntityEvent(MusicEvents.Deleted.TYPE)
  async deleteOneByPath(relativePath: string): Promise<MusicEntity | null> {
    const docOdm = await MusicOdm.Model.findOneAndDelete( {
      path: relativePath,
    } );

    assertFoundClient(docOdm, "Music not found");

    return MusicOdm.toEntity(docOdm);
  }
}

function isDuplicateKeyError(e: unknown): boolean {
  return e instanceof Error && e.message.includes("E11000 duplicate key");
}
