import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { assertIsDefined } from "$shared/utils/validation";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MusicRestDtos } from "$shared/models/musics/dto/transport";
import { assertFound } from "#utils/validation/found";
import { BrokerEvent } from "#utils/message-broker";
import { CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { EventType, ModelEvent, ModelMessage, PatchEvent } from "#utils/event-sourcing";
import { MusicEntity, Music, MusicId } from "#musics/models";
import { MusicHistoryEntry } from "#musics/history/models";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { QUEUE_NAME as MUSIC_HISTORY_QUEUE_NAME } from "../history/events";
import { fixUrl } from "../builder/fix-url";
import { MusicBuilderService } from "../builder/music-builder.service";
import { MusicOdm } from "./odm";
import { QUEUE_NAME } from "./events";
import { findParamsToQueryParams } from "./queries/QueriesOdm";
import { ExpressionNode } from "./queries/QueryObject";

type CriteriaOne = MusicRestDtos.GetOne.Criteria;

type MusicEvent = BrokerEvent<ModelMessage<MusicEntity>>;
@Injectable()
export class MusicRepository
implements
CanPatchOneByIdAndGet<MusicEntity, MusicId, Music>,
CanGetOneById<MusicEntity, MusicId> {
  constructor(
    private readonly domainMessageBroker: DomainMessageBroker,
    @Inject(forwardRef(()=>MusicBuilderService))
    private readonly musicBuilder: MusicBuilderService,
  ) {
    this.domainMessageBroker.subscribe(QUEUE_NAME, (event: MusicEvent) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);

    this.domainMessageBroker.subscribe(
      MUSIC_HISTORY_QUEUE_NAME,
      async (_ev: BrokerEvent<unknown>) => {
        const event = _ev as ModelEvent<MusicHistoryEntry>;

        if (event.type !== EventType.CREATED)
          return;

        const id = event.payload.entity.resourceId;
        const lastTimePlayed = event.payload.entity.date.timestamp;

        await this.patchOneByIdAndGet(id, {
          entity: {
            lastTimePlayed,
          },
        } ).catch(showError);
      },
    ).catch(showError);
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

    // Emite un evento por cada propiedad cambiada
    for (const [k, value] of Object.entries(entity)) {
      const key = k as keyof MusicEntity;
      const event = new PatchEvent<MusicEntity, MusicId>( {
        entityId: id,
        key,
        value,
      } );

      await this.domainMessageBroker.publish(QUEUE_NAME, event);
    }

    for (const p of params.unset ?? []) {
      const event = new PatchEvent<MusicEntity, MusicId>( {
        entityId: id,
        key: p.join(".") as keyof MusicEntity,
        value: undefined,
      } );

      await this.domainMessageBroker.publish(QUEUE_NAME, event);
    }

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

  async createOneAndGet(music: Music): Promise<MusicEntity> {
    const docOdm = MusicOdm.toDoc(music);
    const gotDocOdm = await MusicOdm.Model.create(docOdm);
    const entity = MusicOdm.toEntity(gotDocOdm);
    const event = new ModelEvent<MusicEntity>(EventType.CREATED, {
      entity: entity,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return entity;
  }

  async deleteOneByPath(relativePath: string) {
    const docOdm = await MusicOdm.Model.findOneAndDelete( {
      path: relativePath,
    } );

    if (!docOdm)
      return;

    const entity = MusicOdm.toEntity(docOdm);
    const event = new ModelEvent<MusicEntity>(EventType.DELETED, {
      entity,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);
  }

  async updateOneByUrl(url: string, data: Partial<Music>): Promise<void> {
    return await this.#updateOneAndGet(data, {
      url,
    } );
  }

  async updateOneByHash(hash: string, data: Partial<Music>): Promise<void> {
    return await this.#updateOneAndGet(data, {
      hash,
    } );
  }

  async #updateOneAndGet(
    data: Partial<Music>,
    filterCriteria: CriteriaOne["filter"],
  ) {
    data.timestamps ??= {} as Music["timestamps"];
    data.timestamps.updatedAt = new Date();

    const filter = filterCriteria; // TODO

    await MusicOdm.Model.updateOne(filter, data);

    const model = await this.getOne( {
      filter: filterCriteria,
    } );

    assertIsDefined(model);
    const event = new ModelEvent<MusicEntity>(EventType.UPDATED, {
      entity: model,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);
  }

  updateOneByPath(relativePath: string, data: Partial<Music>): Promise<void> {
    return this.#updateOneAndGet(data, {
      path: relativePath,
    } );
  }
}
