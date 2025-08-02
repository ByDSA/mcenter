import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MusicRestDtos } from "$shared/models/musics/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { assertFound } from "#utils/validation/found";
import { DomainEvent } from "#modules/domain-event-emitter";
import { CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { MusicEntity, Music, MusicId } from "#musics/models";
import { DomainEventEmitter } from "#modules/domain-event-emitter";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { logDomainEvent } from "#main/logging/log-domain-event";
import { EmitEntityEvent } from "#modules/domain-event-emitter/emit-event";
import { showError } from "#main/logging/show-error";
import { fixUrl } from "../builder/fix-url";
import { MusicBuilderService } from "../builder/music-builder.service";
import { MusicHistoryEntryEvents } from "../history/repositories/events";
import { MusicOdm } from "./odm";
import { MusicEvents } from "./events";
import { findParamsToQueryParams } from "./queries/QueriesOdm";
import { ExpressionNode } from "./queries/QueryObject";

type CriteriaOne = MusicRestDtos.GetOne.Criteria;

@Injectable()
export class MusicRepository
implements
CanPatchOneByIdAndGet<MusicEntity, MusicId, Music>,
CanGetOneById<MusicEntity, MusicId> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    @Inject(forwardRef(()=>MusicBuilderService))
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
    const docOdm = await MusicOdm.Model.findById(id);

    if (!docOdm)
      return null;

    return MusicOdm.toEntity(docOdm);
  }

  async patchOneByIdAndGet(id: MusicId, params: PatchOneParams<Music>): Promise<MusicEntity> {
    const { entity } = params;

    if (entity.url)
      entity.url = fixUrl(entity.url) ?? undefined;

    const updateQuery = patchParamsToUpdateQuery(params, MusicOdm.partialToDoc);

    updateQuery.$set = {
      ...updateQuery.$set,
      "timestamps.updatedAt": new Date(),
    };

    const gotDoc = await MusicOdm.Model.findByIdAndUpdate(id, updateQuery, {
      new: true,
    } );

    assertFound(gotDoc);

    const ret = MusicOdm.toEntity(gotDoc);

    this.domainEventEmitter.emitPatch(MusicEvents.Patched.TYPE, {
      entity,
      id,
      unset: params.unset,
    } );

    return ret;
  }

  async getOne(criteria: CriteriaOne): Promise<MusicEntity | null> {
    const pipeline = MusicOdm.getCriteriaPipeline(criteria);
    const docs: MusicOdm.FullDoc[] = await MusicOdm.Model.aggregate(pipeline);

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

  async getOneByUrl(url: string, criteria?: CriteriaOne): Promise<MusicEntity | null> {
    return await this.getOneByFilter( {
      url,
    }, criteria);
  }

  async getAll(): Promise<MusicEntity[]> {
    const docOdms = await MusicOdm.Model.find( {} );
    const ret = docOdms.map(MusicOdm.toEntity);

    return ret;
  }

  async getManyByQuery(params: ExpressionNode): Promise<MusicEntity[]> {
    const query = findParamsToQueryParams(params);
    const docOdms = await MusicOdm.Model.find(query);
    const ret = docOdms.map(MusicOdm.toEntity);

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
    const music = await this.musicBuilder.build(relativePath);

    return await this.createOneAndGet(music);
  }

  @EmitEntityEvent(MusicEvents.Created.TYPE)
  async createOneAndGet(music: Music): Promise<MusicEntity> {
    const docOdm = MusicOdm.toDoc(music);
    const gotDocOdm = await MusicOdm.Model.create(docOdm);

    return MusicOdm.toEntity(gotDocOdm);
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
