import { Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { CanCreateOneBySuperId } from "#utils/layers/repository";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeHistoryEntry, EpisodeHistoryListId } from "../models";
import { HistoryListModelOdm as ModelOdm } from "./odm";
import { ENTRY_QUEUE_NAME } from "./events";
import { entryToDocOdm } from "./odm";

@Injectable()
export class EpisodeHistoryListEntryRepository
implements CanCreateOneBySuperId<EpisodeHistoryEntry, EpisodeHistoryListId> {
  constructor(private domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(ENTRY_QUEUE_NAME, (event: any) => {
      logDomainEvent(ENTRY_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  static providers = Object.freeze([
    DomainMessageBroker,
  ]);

  async createOneBySuperId(id: EpisodeHistoryListId, entry: EpisodeHistoryEntry): Promise<void> {
    const entryDocOdm = entryToDocOdm(entry);

    await ModelOdm.updateOne( {
      id,
    }, {
      $push: {
        entries: entryDocOdm,
      },
    } );

    const event = new ModelEvent<EpisodeHistoryEntry>(EventType.CREATED, {
      entity: entry,
    } );

    await this.domainMessageBroker.publish(ENTRY_QUEUE_NAME, event);
  }
}
