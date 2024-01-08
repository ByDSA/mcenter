import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { PublicMethodsOf } from "#shared/utils/types";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateOne, CanGetAll } from "#utils/layers/repository";
import { Model } from "../models";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { QUEUE_NAME } from "./events";
import { ModelOdm } from "./odm";

const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class Repository
implements
CanCreateOne<Model>,
CanGetAll<Model> {
  #domainMessageBroker: PublicMethodsOf<DomainMessageBroker>;

  constructor(deps?: Partial<Deps>) {
    this.#domainMessageBroker = (deps as Deps).domainMessageBroker;

    this.#domainMessageBroker.subscribe(QUEUE_NAME, (event: any) => {
      logDomainEvent(QUEUE_NAME, event);

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

  async createOne(model: Model): Promise<void> {
    const docOdm = modelToDocOdm(model);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<Model>(EventType.CREATED, {
      entity: model,
    } );

    await this.#domainMessageBroker.publish(QUEUE_NAME, event);
  }
}