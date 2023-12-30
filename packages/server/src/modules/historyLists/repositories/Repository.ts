import { DomainMessageBroker } from "#modules/domain-message-broker";
import { QUEUE_NAME } from "#modules/episodes/repositories";
import { logDomainEvent } from "#modules/log";
import { HistoryList } from "#shared/models/historyLists";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { CanCreateOne, CanGetAll, CanGetOneByIdOrCreate, CanUpdateOneById } from "#utils/layers/repository";
import { Model, ModelId } from "../models";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { ModelOdm } from "./odm";

export default class Repository
implements CanUpdateOneById<Model, ModelId>,
CanGetOneByIdOrCreate<Model, ModelId>,
CanCreateOne<Model>,
CanGetAll<Model> {
  #domainMessageBroker: DomainMessageBroker;

  constructor() {
    this.#domainMessageBroker = DomainMessageBroker.singleton();

    this.#domainMessageBroker.subscribe(QUEUE_NAME, (event: any) => {
      logDomainEvent(event);

      return Promise.resolve();
    } );
  }

  async getAll(): Promise<Model[]> {
    const docsOdm = await ModelOdm.find( {
    }, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToModel);
  }

  async createOne(historyList: Model): Promise<void> {
    const docOdm = modelToDocOdm(historyList);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<Model>(EventType.CREATED, {
      entity: historyList,
    } );

    this.#domainMessageBroker.publish(QUEUE_NAME, event);
  }

  async #createOneDefaultModelById(id: ModelId): Promise<Model> {
    const historyList: HistoryList = {
      id,
      entries: [],
      maxSize: -1,
    };

    await this.createOne(historyList);

    return historyList;
  }

  async getOneByIdOrCreate(id: ModelId): Promise<Model> {
    const docOdm = await ModelOdm.findOne( {
      id,
    }, {
      _id: 0,
    } );

    if (docOdm)
      return docOdmToModel(docOdm);

    return this.#createOneDefaultModelById(id);
  }

  async updateOneById(id: ModelId, historyList: Model): Promise<void> {
    const docOdm = modelToDocOdm(historyList);

    await ModelOdm.findOneAndUpdate( {
      id,
    }, docOdm);

    const event = new ModelEvent<Model>(EventType.UPDATED, {
      entity: historyList,
    } );

    this.#domainMessageBroker.publish(QUEUE_NAME, event);
  }
}