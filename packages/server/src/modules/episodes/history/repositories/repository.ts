import { Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { CanCreateOne, CanGetAll, CanGetOneByIdOrCreate, CanUpdateOneById } from "#utils/layers/repository";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeHistoryListEntity, EpisodeHistoryListId } from "../models";
import { HistoryListModelOdm as ModelOdm } from "./odm";
import { LIST_QUEUE_NAME } from "./events";
import { historyListDocOdmToEntity as docOdmToEntity, historyListEntityToDocOdm as entityToDocOdm } from "./odm";

@Injectable()
export class EpisodeHistoryListRepository
implements CanUpdateOneById<EpisodeHistoryListEntity, EpisodeHistoryListId>,
CanGetOneByIdOrCreate<EpisodeHistoryListEntity, EpisodeHistoryListId>,
CanCreateOne<EpisodeHistoryListEntity>,
CanGetAll<EpisodeHistoryListEntity> {
  constructor(private domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(LIST_QUEUE_NAME, (event: any) => {
      logDomainEvent(LIST_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  static providers = Object.freeze([
    DomainMessageBroker,
  ]);

  async getAll(): Promise<EpisodeHistoryListEntity[]> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToEntity);
  }

  async createOne(historyList: EpisodeHistoryListEntity): Promise<void> {
    const docOdm = entityToDocOdm(historyList);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<EpisodeHistoryListEntity>(EventType.CREATED, {
      entity: historyList,
    } );

    await this.domainMessageBroker.publish(LIST_QUEUE_NAME, event);
  }

  async #createOneDefaultModelById(id: EpisodeHistoryListId): Promise<EpisodeHistoryListEntity> {
    const historyList: EpisodeHistoryListEntity = {
      id,
      entries: [],
      maxSize: -1,
    };

    await this.createOne(historyList);

    return historyList;
  }

  async getOneByIdOrCreate(id: EpisodeHistoryListId): Promise<EpisodeHistoryListEntity> {
    const docOdm = await ModelOdm.findOne( {
      id,
    }, {
      _id: 0,
    } );

    if (docOdm)
      return docOdmToEntity(docOdm);

    return this.#createOneDefaultModelById(id);
  }

  async updateOneById(
    id: EpisodeHistoryListId,
    historyList: EpisodeHistoryListEntity,
  ): Promise<void> {
    const docOdm = entityToDocOdm(historyList);

    await ModelOdm.findOneAndUpdate( {
      id,
    }, docOdm);

    const event = new ModelEvent<EpisodeHistoryListEntity>(EventType.UPDATED, {
      entity: historyList,
    } );

    await this.domainMessageBroker.publish(LIST_QUEUE_NAME, event);
  }
}
