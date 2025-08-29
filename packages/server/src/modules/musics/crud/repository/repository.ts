import { forwardRef, Inject, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { UpdateQuery } from "mongoose";
import { MusicFileInfoEntity, MusicFileInfoOmitMusicId } from "$shared/models/musics/file-info";
import { assertFound } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetManyByCriteria, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { MusicEntity, Music, MusicId } from "#musics/models";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { showError } from "#core/logging/show-error";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicFileInfoRepository } from "#musics/file-info/crud/repository";
import { MusicHistoryEntryEvents } from "../../history/crud/repository/events";
import { MusicBuilderService } from "../builder/music-builder.service";
import { MusicAvailableSlugGeneratorService } from "../builder/vailable-slug-generator.service";
import { ExpressionNode } from "./queries/query-object";
import { findParamsToQueryParams } from "./queries/queries-odm";
import { MusicEvents } from "./events";
import { MusicOdm } from "./odm";
import { AggregationResult } from "./odm/criteria-pipeline";

type CriteriaOne = MusicCrudDtos.GetOne.Criteria;
type CriteriaMany = MusicCrudDtos.GetMany.Criteria;

@Injectable()
export class MusicsRepository
implements
CanPatchOneByIdAndGet<MusicEntity, MusicId, Music>,
CanGetOneById<MusicEntity, MusicId>,
CanDeleteOneByIdAndGet<MusicEntity, MusicEntity["id"]>,
CanGetManyByCriteria<MusicEntity, CriteriaMany> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    @Inject(forwardRef(()=>MusicAvailableSlugGeneratorService))
    private readonly slugGenerator: MusicAvailableSlugGeneratorService,
    private readonly musicBuilder: MusicBuilderService,
    private readonly fileInfoRepo: MusicFileInfoRepository,
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
    } ).catch(showError);
  }

  async deleteOneByIdAndGet(id: string): Promise<MusicEntity> {
    const doc = await MusicOdm.Model.findByIdAndDelete(id);

    assertFound(doc);

    const ret = MusicOdm.toEntity(doc);

    this.domainEventEmitter.emitEntity(MusicEvents.Deleted.TYPE, ret);

    return ret;
  }

  async getOneById(id: string): Promise<MusicEntity | null> {
    const doc = await MusicOdm.Model.findById(id);

    assertFound(doc);

    return MusicOdm.toEntity(doc);
  }

  async getManyByCriteria(criteria: CriteriaMany): Promise<any> {
    const actualCriteria: CriteriaMany = {
      ...criteria,
      limit: criteria.limit ?? 10,
    };
    const pipeline = MusicOdm.getCriteriaPipeline(actualCriteria);
    const aggreationResult = await MusicOdm.Model.aggregate(pipeline) as AggregationResult;
    const docs = aggreationResult[0].data;

    if (docs.length > 0 && actualCriteria?.expand?.includes("fileInfos"))
      assertIsDefined(docs[0].fileInfos, "Lookup file infos failed");

    return MusicOdm.toPaginatedResult(aggreationResult);
  }

  async patchOneByIdAndGet(id: MusicId, params: PatchOneParams<Music>): Promise<MusicEntity> {
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

    assertFound(doc);

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
    const query = findParamsToQueryParams(params);
    const docs = await MusicOdm.Model.find(query);
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
    const fileInfo = await this.fileInfoRepo.upsertOneByPathAndGet(relativePath, {
      ...localFileMusic,
      musicId: music.id,
    } );

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

    assertFound(docOdm, "Music not found");

    return MusicOdm.toEntity(docOdm);
  }
}

function isDuplicateKeyError(e: unknown): boolean {
  return e instanceof Error && e.message.includes("E11000 duplicate key");
}
