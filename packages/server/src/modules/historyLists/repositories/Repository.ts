import { showError } from "#shared/utils/errors/showError";
import { PublicMethodsOf } from "#shared/utils/types";
import { CanCreateOne, CanGetAll, CanGetOneByIdOrCreate, CanUpdateOneById } from "#utils/layers/repository";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { HistoryList, HistoryListId } from "../models";
import { ModelOdm } from "./odm";
import { LIST_QUEUE_NAME } from "./events";
import { docOdmToModel, modelToDocOdm } from "./adapters";

const DEPS_MAP = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class HistoryListRepository
implements CanUpdateOneById<HistoryList, HistoryListId>,
CanGetOneByIdOrCreate<HistoryList, HistoryListId>,
CanCreateOne<HistoryList>,
CanGetAll<HistoryList> {
  #domainMessageBroker: PublicMethodsOf<DomainMessageBroker>;

  constructor(deps?: Partial<Deps>) {
    this.#domainMessageBroker = (deps as Deps).domainMessageBroker;

    this.#domainMessageBroker.subscribe(LIST_QUEUE_NAME, (event: any) => {
      logDomainEvent(LIST_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  async getAll(): Promise<HistoryList[]> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToModel);
  }

  async createOne(historyList: HistoryList): Promise<void> {
    const docOdm = modelToDocOdm(historyList);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<HistoryList>(EventType.CREATED, {
      entity: historyList,
    } );

    await this.#domainMessageBroker.publish(LIST_QUEUE_NAME, event);
  }

  async #createOneDefaultModelById(id: HistoryListId): Promise<HistoryList> {
    const historyList: HistoryList = {
      id,
      entries: [],
      maxSize: -1,
    };

    await this.createOne(historyList);

    return historyList;
  }

  async getOneByIdOrCreate(id: HistoryListId): Promise<HistoryList> {
    const docOdm = await ModelOdm.findOne( {
      id,
    }, {
      _id: 0,
    } );

    if (docOdm)
      return docOdmToModel(docOdm);

    return this.#createOneDefaultModelById(id);
  }

  async updateOneById(id: HistoryListId, historyList: HistoryList): Promise<void> {
    const docOdm = modelToDocOdm(historyList);

    await ModelOdm.findOneAndUpdate( {
      id,
    }, docOdm);

    const event = new ModelEvent<HistoryList>(EventType.UPDATED, {
      entity: historyList,
    } );

    await this.#domainMessageBroker.publish(LIST_QUEUE_NAME, event);
  }
}
