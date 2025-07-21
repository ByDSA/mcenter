import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { assertIsDefined } from "$shared/utils/validation";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { assertFound } from "#utils/validation/found";
import { BrokerEvent } from "#utils/message-broker";
import { CanGetOneById, CanPatchOneById } from "#utils/layers/repository";
import { EventType, ModelEvent, ModelMessage, PatchEvent } from "#utils/event-sourcing";
import { MusicEntity, Music, MusicId } from "#musics/models";
import { MusicHistoryEntry } from "#musics/history/models";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { QUEUE_NAME as MUSIC_HISTORY_QUEUE_NAME } from "../history/events";
import { download } from "../youtube";
import { fixUrl } from "../builder/fix-url";
import { MusicBuilderService } from "../builder/music-builder.service";
import { MusicOdm } from "./odm";
import { patchParamsToUpdateQuery } from "./odm/adapters";
import { QUEUE_NAME } from "./events";
import { findParamsToQueryParams } from "./queries/QueriesOdm";
import { ExpressionNode } from "./queries/QueryObject";

type MusicEvent = BrokerEvent<ModelMessage<MusicEntity>>;
@Injectable()
export class MusicRepository
implements
CanPatchOneById<MusicEntity, MusicId, Music>,
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

        await this.patchOneById(id, {
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

  #fixUrlIfHave(partialMusic: Partial<Music>) {
    if (partialMusic.url)
      partialMusic.url = fixUrl(partialMusic.url) ?? undefined;
  }

  async patchOneById(id: MusicId, params: PatchOneParams<Music>): Promise<void> {
    const { entity } = params;
    const updateQuery = patchParamsToUpdateQuery(params);

    this.#fixUrlIfHave(entity);

    updateQuery.$set = {
      ...updateQuery.$set,
      "timestamps.updatedAt": new Date(),
    };

    const ret = await MusicOdm.Model.findByIdAndUpdate(id, updateQuery);

    assertFound(ret);

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
  }

  async getOne(query: Parameters<typeof MusicOdm.Model.findOne>[0]): Promise<MusicEntity | null> {
    const musicOdm: MusicOdm.FullDoc | null = await MusicOdm.Model.findOne(query);

    if (!musicOdm)
      return null;

    return MusicOdm.toEntity(musicOdm);
  }

  getOneByHash(hash: string): Promise<MusicEntity | null> {
    return this.getOne( {
      hash,
    } );
  }

  async getOneByUrl(url: string): Promise<MusicEntity | null> {
    return await this.getOne( {
      url,
    } );
  }

  async getAll(): Promise<MusicEntity[]> {
    const docOdms = await MusicOdm.Model.find( {} );
    const ret = docOdms.map(MusicOdm.toEntity);

    return ret;
  }

  async find(params: ExpressionNode): Promise<MusicEntity[]> {
    const query = findParamsToQueryParams(params);
    const docOdms = await MusicOdm.Model.find(query);
    const ret = docOdms.map(MusicOdm.toEntity);

    return ret;
  }

  findOneByPath(relativePath: string): Promise<MusicEntity | null> {
    return this.getOne( {
      path: relativePath,
    } );
  }

  async createOneFromPath(relativePath: string): Promise<MusicEntity> {
    const music = await this.musicBuilder.build(relativePath);

    return await this.createOneAndGet(music);
  }

  async createOneAndGet(music: Music): Promise<MusicEntity> {
    const docOdm = MusicOdm.toDocOdm(music);
    const gotDocOdm = await MusicOdm.Model.create(docOdm);
    const entity = MusicOdm.toEntity(gotDocOdm);
    const event = new ModelEvent<MusicEntity>(EventType.CREATED, {
      entity: entity,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return entity;
  }

  async findOrCreateOneFromPath(relativePath: string): Promise<MusicEntity> {
    const read = await this.findOneByPath(relativePath);

    if (read)
      return read;

    return this.createOneFromPath(relativePath);
  }

  async findOrCreateOneFromYoutube(strId: string): Promise<MusicEntity> {
    const data = await download(strId);

    return this.findOrCreateOneFromPath(data.file);
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
    return await this.#updateOne( {
      url,
    }, data);
  }

  updateOneByHash(hash: string, data: Partial<Music>): Promise<void> {
    return this.#updateOne( {
      hash,
    }, data);
  }

  async #updateOne(
    query: NonNullable<Parameters<typeof MusicOdm.Model.updateOne>[0]>,
    data: Partial<Music>,
  ) {
    data.timestamps ??= {} as Music["timestamps"];
    data.timestamps.updatedAt = new Date();

    await MusicOdm.Model.updateOne(query, data);

    const queryAfter = applyChangesToQuery(query, data);
    const model = await this.getOne(queryAfter);

    assertIsDefined(model);
    const event = new ModelEvent<MusicEntity>(EventType.UPDATED, {
      entity: model,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);
  }

  updateOneByPath(relativePath: string, data: Partial<Music>): Promise<void> {
    return this.#updateOne( {
      path: relativePath,
    }, data);
  }
}

function applyChangesToQuery<T extends object>(
  query: T,
  changes: Record<string, unknown>,
): T {
  const result: any = Array.isArray(query)
    ? [...query]
    : {
      ...query,
    };

  // eslint-disable-next-line no-restricted-syntax
  for (const key in query) {
    if (key in changes) {
      const value = changes[key];
      const original = query[key];

      if (key in changes && typeof value === "object"
        && key in query && original !== null && typeof original === "object")
        result[key] = applyChangesToQuery(original, value as any);
      else
        result[key] = value;
    }
  }

  return result;
}
