import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { UpdateQuery } from "mongoose";
import { assertFound } from "#utils/validation/found";
import { CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { MusicEntity, Music, MusicId } from "#musics/models";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { showError } from "#core/logging/show-error";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicHistoryEntryEvents } from "../../history/crud/repository/events";
import { MusicBuilderService } from "../builder/music-builder.service";
import { MusicAvailableSlugGeneratorService } from "../builder/vailable-slug-generator.service";
import { ExpressionNode } from "./queries/query-object";
import { findParamsToQueryParams } from "./queries/queries-odm";
import { MusicEvents } from "./events";
import { MusicOdm } from "./odm";

type CriteriaOne = MusicCrudDtos.GetOne.Criteria;

@Injectable()
export class MusicsRepository
implements
CanPatchOneByIdAndGet<MusicEntity, MusicId, Music>,
CanGetOneById<MusicEntity, MusicId> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    @Inject(forwardRef(()=>MusicAvailableSlugGeneratorService))
    private readonly slugGenerator: MusicAvailableSlugGeneratorService,
    private readonly musicBuilder: MusicBuilderService,
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

  async getOneById(id: string): Promise<MusicEntity | null> {
    const doc = await MusicOdm.Model.findById(id);

    if (!doc)
      return null;

    return MusicOdm.toEntity(doc);
  }

  async patchOneByIdAndGet(id: MusicId, params: PatchOneParams<Music>): Promise<MusicEntity> {
    const { entity: paramEntity } = params;
    const validEntity = this.musicBuilder.fixFields(paramEntity);
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
    const docs = await MusicOdm.Model.aggregate(pipeline);

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

  async createOneFromPath(relativePath: string): Promise<MusicEntity> {
    const music = await this.musicBuilder.createMusicFromFile(relativePath);

    return await this.createOneAndGet(music);
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
