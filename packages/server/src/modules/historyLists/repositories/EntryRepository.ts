import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { PublicMethodsOf } from "#shared/utils/types";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateOneBySuperId } from "#utils/layers/repository";
import { Entry, ModelId } from "../models";
import { entryToDocOdm } from "./adapters";
import { ENTRY_QUEUE_NAME } from "./events";
import { ModelOdm } from "./odm";

const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class EntryRepository
implements CanCreateOneBySuperId<Entry, ModelId> {
  #domainMessageBroker: PublicMethodsOf<DomainMessageBroker>;

  constructor(deps?: Partial<Deps>) {
    this.#domainMessageBroker = (deps as Deps).domainMessageBroker;

    this.#domainMessageBroker.subscribe(ENTRY_QUEUE_NAME, (event: any) => {
      logDomainEvent(ENTRY_QUEUE_NAME, event);

      return Promise.resolve();
    } );
  }

  async createOneBySuperId(id: ModelId, entry: Entry): Promise<void> {
    const entryDocOdm = entryToDocOdm(entry);

    await ModelOdm.updateOne( {
      id,
    }, {
      $push: {
        entries: entryDocOdm,
      },
    } );

    const event = new ModelEvent<Entry>(EventType.CREATED, {
      entity: entry,
    } );

    this.#domainMessageBroker.publish(ENTRY_QUEUE_NAME, event);
  }
}