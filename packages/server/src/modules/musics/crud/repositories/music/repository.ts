import { forwardRef, Inject, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { Types, UpdateQuery } from "mongoose";
import { MusicFileInfoEntity, MusicFileInfoOmitMusicId } from "$shared/models/musics/file-info";
import { assertFoundClient } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { MusicEntity, Music, MusicId } from "#musics/models";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicFileInfoRepository } from "#musics/file-info/crud/repository";
import { MusicsSearchService } from "#modules/search/search-services/musics.search.service";
import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";
import { MusicBuilderService } from "../../builder/music-builder.service";
import { MusicAvailableSlugGeneratorService } from "../../builder/vailable-slug-generator.service";
import { ExpressionNode } from "./queries/query-object";
import { MusicEvents } from "./events";
import { MusicOdm } from "./odm";
import { AggregationResult } from "./odm/criteria-pipeline";
import { expressionToMeilisearchQuery } from "./queries/queries-meili";
import { GetManyByCriteriaMusicRepoService } from "./get-many-criteria";

type CriteriaOne = MusicCrudDtos.GetOne.Criteria;
type CriteriaMany = MusicCrudDtos.GetMany.Criteria;

@Injectable()
export class MusicsRepository
implements
CanPatchOneByIdAndGet<MusicEntity, MusicId, Music>,
CanGetOneById<MusicEntity, MusicId>,
CanDeleteOneByIdAndGet<MusicEntity, MusicEntity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    @Inject(forwardRef(()=>MusicAvailableSlugGeneratorService))
    private readonly slugGenerator: MusicAvailableSlugGeneratorService,
    private readonly musicBuilder: MusicBuilderService,
    private readonly fileInfoRepo: MusicFileInfoRepository,
    private readonly musicsSearchService: MusicsSearchService,
    private readonly getManyByCriteriaMusicRepoService: GetManyByCriteriaMusicRepoService,
  ) { }

  @OnEvent(MusicEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
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

  async getManyByCriteria(userId: string | null, criteria: CriteriaMany): Promise<any> {
    return await this.getManyByCriteriaMusicRepoService.doAction(userId, criteria);
  }

  async patchOneByIdAndGet(
    id: MusicId,
    params: PatchOneParams<Music>,
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

    if (paramEntity.tags?.length === 0) {
      updateQuery.$unset = {
        ...updateQuery.$unset,
        tags: true,
      };
    }

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

  async getAll(
    criteria?: CriteriaMany,
  ): Promise<MusicEntity[]> {
    let docs;

    if (criteria) {
      const pipeline = MusicOdm.getCriteriaPipeline(criteria);

      if (pipeline.length === 0)
        throw new UnprocessableEntityException(criteria);

      const result = await MusicOdm.Model.aggregate(pipeline) as AggregationResult;

      docs = result[0].data;
    } else
      docs = await MusicOdm.Model.find( {} );

    const ret = docs.map(MusicOdm.toEntity);

    return ret;
  }

  async getManyByQuery(
    userId: string | null,
    params: ExpressionNode,
    criteria?: Pick<CriteriaMany, "expand">,
  ): Promise<MusicEntity[]> {
    const query = expressionToMeilisearchQuery(params);
    const meiliRet = await this.musicsSearchService.filter(userId, query, {
      limit: 0,
    } );
    const meiliDocs = meiliRet.data;
    const meiliDocsMap: Record<string, typeof meiliDocs[0]> = {};

    for (const doc of meiliDocs)
      meiliDocsMap[doc.musicId] = doc;

    if (meiliDocs.length === 0)
      return [];

    const ids = meiliDocs.map(doc => new Types.ObjectId(doc.musicId));
    // Nota: no tiene por qué respetarse el orden de los meiliDocs
    const pipeline: any[] = [
      {
        $match: {
          _id: {
            $in: ids,
          },
        },
      },
    ];
    const docs: MusicOdm.FullDoc[] = await MusicOdm.Model.aggregate(pipeline);
    const fakeId = new Types.ObjectId();

    if (criteria?.expand?.includes("userInfo")) {
      if (userId) {
        for (const d of docs) {
          const u = meiliDocsMap[d._id.toString()];

          d.userInfo = {
            _id: fakeId,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastTimePlayed: u.lastTimePlayedAt,
            musicId: new Types.ObjectId(u.musicId),
            userId: new Types.ObjectId(userId),
            weight: u.weight,
          } satisfies MusicsUsersOdm.FullDoc;
        }
      } else {
        for (const d of docs) {
          d.userInfo = {
            _id: fakeId,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastTimePlayed: 0,
            musicId: "$_id" as any,
            userId: fakeId,
            weight: 0,
          } satisfies MusicsUsersOdm.FullDoc;
        }
      }
    }

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
    userId: string,
    localFileMusic?: Partial<MusicFileInfoOmitMusicId>,
  ): Promise<{music: MusicEntity;
fileInfo: MusicFileInfoEntity;}> {
    const musicDto = await this.musicBuilder.createMusicFromFile(relativePath, userId);
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
