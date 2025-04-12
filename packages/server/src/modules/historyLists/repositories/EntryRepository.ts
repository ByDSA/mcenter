import { showError } from "#shared/utils/errors/showError";
import { PublicMethodsOf } from "#shared/utils/types";
import { CanCreateOneBySuperId } from "#utils/layers/repository";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { HistoryEntry, HistoryListId } from "../models";
import { ModelOdm } from "./odm";
import { ENTRY_QUEUE_NAME } from "./events";
import { entryToDocOdm } from "./adapters";

const DEPS_MAP = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class HistoryListEntryRepository
implements CanCreateOneBySuperId<HistoryEntry, HistoryListId> {
  #domainMessageBroker: PublicMethodsOf<DomainMessageBroker>;

  constructor(deps?: Partial<Deps>) {
    this.#domainMessageBroker = (deps as Deps).domainMessageBroker;

    this.#domainMessageBroker.subscribe(ENTRY_QUEUE_NAME, (event: any) => {
      logDomainEvent(ENTRY_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  async createOneBySuperId(id: HistoryListId, entry: HistoryEntry): Promise<void> {
    const entryDocOdm = entryToDocOdm(entry);

    await ModelOdm.updateOne( {
      id,
    }, {
      $push: {
        entries: entryDocOdm,
      },
    } );

    const event = new ModelEvent<HistoryEntry>(EventType.CREATED, {
      entity: entry,
    } );

    await this.#domainMessageBroker.publish(ENTRY_QUEUE_NAME, event);
  }
}
