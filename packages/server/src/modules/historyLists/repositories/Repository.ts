import { Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { CanCreateOne, CanGetAll, CanGetOneByIdOrCreate, CanUpdateOneById } from "#utils/layers/repository";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { HistoryListEntity, HistoryListId } from "../models";
import { ModelOdm } from "./odm";
import { LIST_QUEUE_NAME } from "./events";
import { docOdmToEntity, entityToDocOdm } from "./adapters";

@Injectable()
export class HistoryListRepository
implements CanUpdateOneById<HistoryListEntity, HistoryListId>,
CanGetOneByIdOrCreate<HistoryListEntity, HistoryListId>,
CanCreateOne<HistoryListEntity>,
CanGetAll<HistoryListEntity> {
  constructor(private domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(LIST_QUEUE_NAME, (event: any) => {
      logDomainEvent(LIST_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  static providers = Object.freeze([
    DomainMessageBroker,
  ]);

  async getAll(): Promise<HistoryListEntity[]> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToEntity);
  }

  async createOne(historyList: HistoryListEntity): Promise<void> {
    const docOdm = entityToDocOdm(historyList);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<HistoryListEntity>(EventType.CREATED, {
      entity: historyList,
    } );

    await this.domainMessageBroker.publish(LIST_QUEUE_NAME, event);
  }

  async #createOneDefaultModelById(id: HistoryListId): Promise<HistoryListEntity> {
    const historyList: HistoryListEntity = {
      id,
      entries: [],
      maxSize: -1,
    };

    await this.createOne(historyList);

    return historyList;
  }

  async getOneByIdOrCreate(id: HistoryListId): Promise<HistoryListEntity> {
    const docOdm = await ModelOdm.findOne( {
      id,
    }, {
      _id: 0,
    } );

    if (docOdm)
      return docOdmToEntity(docOdm);

    return this.#createOneDefaultModelById(id);
  }

  async updateOneById(id: HistoryListId, historyList: HistoryListEntity): Promise<void> {
    const docOdm = entityToDocOdm(historyList);

    await ModelOdm.findOneAndUpdate( {
      id,
    }, docOdm);

    const event = new ModelEvent<HistoryListEntity>(EventType.UPDATED, {
      entity: historyList,
    } );

    await this.domainMessageBroker.publish(LIST_QUEUE_NAME, event);
  }
}
