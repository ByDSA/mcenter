import { FilterQuery } from "mongoose";
import { Injectable } from "@nestjs/common";
import { isDefined } from "$shared/utils/validation";
import { showError } from "$shared/utils/errors/showError";
import { musicHistoryEntryRestDto } from "$shared/models/musics/history/dto/transport";
import z from "zod";
import { assertFound } from "#utils/validation/found";
import { CanCreateOne, CanDeleteOneByIdAndGet, CanGetAll, CanGetManyCriteria, CanGetOneById } from "#utils/layers/repository";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { MusicHistoryEntry } from "#musics/history/models";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { BrokerEvent } from "#utils/message-broker";
import { QUEUE_NAME } from "../events";
import { MusicRepository } from "../../repositories/Repository";
import { DocOdm, ModelOdm } from "./odm";
import { docOdmToModel, modelToDocOdm } from "./adapters";

export type GetManyCriteria = z.infer<
  typeof musicHistoryEntryRestDto.getManyEntriesByCriteria.reqBodySchema
>;
type EntryId = Required<MusicHistoryEntry["id"]>;

@Injectable()
export class MusicHistoryRepository
implements
CanCreateOne<MusicHistoryEntry>,
CanGetManyCriteria<MusicHistoryEntry, GetManyCriteria>,
CanGetAll<MusicHistoryEntry>,
CanGetOneById<MusicHistoryEntry, EntryId>,
CanDeleteOneByIdAndGet<MusicHistoryEntry, EntryId> {
  constructor(
    private readonly domainMessageBroker: DomainMessageBroker,
    private readonly musicRepository: MusicRepository,
  ) {
    this.domainMessageBroker.subscribe(QUEUE_NAME, (event: any) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);

    this.domainMessageBroker.subscribe(QUEUE_NAME, async (_ev: BrokerEvent<unknown>) => {
      const event = _ev as ModelEvent<MusicHistoryEntry>;

      if (event.type !== EventType.DELETED)
        return;

      const deletedId = event.payload.entity.resourceId;
      const deletedTimestamp = event.payload.entity.date.timestamp;
      const actualLastTimePlayed = await this.calcLastTimePlayedOf(deletedId) ?? 0;

      if (actualLastTimePlayed < deletedTimestamp) {
        await this.musicRepository.patchOneById(deletedId, {
          entity: {
            lastTimePlayed: actualLastTimePlayed,
          },
        } ).catch(showError);
      }
    } ).catch(showError);
  }

  async deleteOneByIdAndGet(id: EntryId): Promise<MusicHistoryEntry> {
    const deleted = await ModelOdm.findByIdAndDelete(id);

    assertFound(deleted);

    const ret = docOdmToModel(deleted);
    const event = new ModelEvent<MusicHistoryEntry>(EventType.DELETED, {
      entity: ret,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return ret;
  }

  async getOneById(id: EntryId): Promise<MusicHistoryEntry | null> {
    const docOdm = await ModelOdm.findById(id);

    if (docOdm)
      return docOdmToModel(docOdm);

    return null;
  }

  async calcLastTimePlayedOf(id: Required<MusicHistoryEntry["id"]>): Promise<number | null> {
    const docOdm = await ModelOdm.findOne( {
      musicId: id,
    } )
      .sort( {
        "date.timestamp": -1,
      } );

    return docOdm?.date?.timestamp ?? null;
  }

  async getManyCriteria(criteria: GetManyCriteria): Promise<MusicHistoryEntry[]> {
    const findParams: FilterQuery<DocOdm> = {};

    if (criteria.filter?.resourceId)
      findParams.musicId = criteria.filter.resourceId;

    if (criteria.filter?.timestampMax) {
      findParams["date.timestamp"] = {
        $lte: criteria.filter.timestampMax,
      };
    }

    const query = ModelOdm.find(findParams);

    if (criteria.sort?.timestamp) {
      query.sort( {
        "date.timestamp": criteria.sort.timestamp?.[0] === "asc" ? 1 : -1,
      } );
    }

    if (criteria.offset)
      query.skip(criteria.offset);

    if (isDefined(criteria.limit))
      query.limit(criteria.limit);

    const docsOdm = await query;

    if (docsOdm.length === 0)
      return [];

    const models = docsOdm.map(docOdmToModel);

    if (criteria.expand?.includes("musics")) {
      const promises = models.map(async (model) => {
        const { resourceId } = model;
        const resource = await this.musicRepository.getOneById(resourceId);

        if (resource)

          model.resource = resource;
      } );

      await Promise.all(promises);
    }

    return models;
  }

  async getAll(): Promise<MusicHistoryEntry[]> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToModel);
  }

  async #getLastOdm(): Promise<DocOdm | null> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } ).sort( {
      "date.timestamp": -1,
    } )
      .limit(1);

    if (docsOdm.length === 0)
      return null;

    return docsOdm[0];
  }

  async getLast(): Promise<MusicHistoryEntry | null> {
    const docOdm = await this.#getLastOdm();

    if (!docOdm)
      return null;

    return docOdmToModel(docOdm);
  }

  async createOne(model: MusicHistoryEntry): Promise<void> {
    const lastOdm = await this.#getLastOdm();

    if (lastOdm?.musicId === model.resourceId)
      return;

    const docOdm = modelToDocOdm(model);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<MusicHistoryEntry>(EventType.CREATED, {
      entity: model,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);
  }
}
