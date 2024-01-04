import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { PublicMethodsOf } from "#shared/utils/types";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateOne, CanGetAll, CanGetOneByIdOrCreate, CanUpdateOneById } from "#utils/layers/repository";
import { Model, ModelId } from "../models";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { LIST_QUEUE_NAME } from "./events";
import { ModelOdm } from "./odm";

const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class Repository
implements CanUpdateOneById<Model, ModelId>,
CanGetOneByIdOrCreate<Model, ModelId>,
CanCreateOne<Model>,
CanGetAll<Model> {
  #domainMessageBroker: PublicMethodsOf<DomainMessageBroker>;

  constructor(deps?: Partial<Deps>) {
    this.#domainMessageBroker = (deps as Deps).domainMessageBroker;

    this.#domainMessageBroker.subscribe(LIST_QUEUE_NAME, (event: any) => {
      logDomainEvent(LIST_QUEUE_NAME, event);

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

    await this.#domainMessageBroker.publish(LIST_QUEUE_NAME, event);
  }

  async #createOneDefaultModelById(id: ModelId): Promise<Model> {
    const historyList: Model = {
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

    await this.#domainMessageBroker.publish(LIST_QUEUE_NAME, event);
  }
}