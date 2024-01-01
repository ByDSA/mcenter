import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { CanCreateOneBySuperId } from "#utils/layers/repository";
import { Entry, ModelId } from "../models";
import { entryToDocOdm } from "./adapters";
import { ENTRY_QUEUE_NAME } from "./events";
import { ModelOdm } from "./odm";

export default class EntryRepository
implements CanCreateOneBySuperId<Entry, ModelId> {
  #domainMessageBroker: DomainMessageBroker;

  constructor() {
    this.#domainMessageBroker = DomainMessageBroker.singleton();

    this.#domainMessageBroker.subscribe(ENTRY_QUEUE_NAME, (event: any) => {
      logDomainEvent(event);

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