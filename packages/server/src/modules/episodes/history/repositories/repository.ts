import type { EpisodeCompKey, EpisodeEntity, EpisodeId } from "#episodes/models";
import type { BrokerEvent } from "#utils/message-broker";
import type { CanCreateOne, CanDeleteOneByIdAndGet } from "#utils/layers/repository";
import type { EpisodeHistoryEntryId as Id, EpisodeHistoryEntry as Model, EpisodeHistoryEntryEntity as Entity, EpisodeHistoryEntryEntity } from "../models";
import type { EpisodeHistoryEntryRestDtos } from "$shared/models/episodes/history/dto/transport";
import { showError } from "$shared/utils/errors/showError";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { createEpisodeHistoryEntryByEpisodeCompKey } from "$shared/models/episodes/history/utils";
import { EventType, ModelEvent, ModelMessage } from "#utils/event-sourcing";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { assertFound } from "#utils/validation/found";
import { SeriesKey } from "#modules/series";
import { EpisodeHistoryEntriesModelOdm as ModelOdm } from "./odm";
import { EPISODE_HISTORY_ENTRIES_QUEUE_NAME } from "./events";
import { entryToDocOdm } from "./odm";
import { docOdmToEntryEntity } from "./odm/adapters";
import { getCriteriaPipeline } from "./criteria-pipeline";

export type EpisodeHistoryEntryEvent = BrokerEvent<ModelMessage<EpisodeHistoryEntryEntity>>;

@Injectable()
export class EpisodeHistoryEntriesRepository implements
CanCreateOne<Model>,
CanDeleteOneByIdAndGet<Model, Id> {
  constructor(
    private readonly domainMessageBroker: DomainMessageBroker,
  ) {
    this.domainMessageBroker.subscribe(
      EPISODE_HISTORY_ENTRIES_QUEUE_NAME,
      (event: EpisodeHistoryEntryEvent) => {
        logDomainEvent(EPISODE_HISTORY_ENTRIES_QUEUE_NAME, event);

        return Promise.resolve();
      },
    ).catch(showError);
  }

  async createOne(entry: Model): Promise<void> {
    const entryDocOdm = entryToDocOdm(entry);

    await ModelOdm.create(entryDocOdm);

    const event = new ModelEvent<Model>(EventType.CREATED, {
      entity: entry,
    } );

    await this.domainMessageBroker.publish(EPISODE_HISTORY_ENTRIES_QUEUE_NAME, event);
  }

  async getAll(): Promise<Entity[]> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToEntryEntity);
  }

  async getManyBySeriesKey(seriesKey: SeriesKey): Promise<Entity[]> {
    return await this.getManyByCriteria( {
      filter: {
        seriesKey,
      },
    } );
  }

  async getManyByCriteria(
    criteria: EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria,
  ): Promise<Entity[]> {
    const pipeline = getCriteriaPipeline(criteria);
    const docsOdm = await ModelOdm.aggregate(pipeline);

    if (docsOdm.length === 0)
      return [];

    if (criteria.expand?.includes("series"))
      assertIsDefined(docsOdm[0].serie, "Lookup serie failed");

    if (criteria.expand?.includes("episodes"))
      assertIsDefined(docsOdm[0].episode, "Lookup episode failed");

    if (criteria.expand?.includes("episode-file-infos"))
      assertIsDefined(docsOdm[0].episode.fileInfos, "Lookup episode file info failed");

    return docsOdm.map(docOdmToEntryEntity);
  }

  async deleteOneByIdAndGet(id: Id): Promise<Entity> {
    const docOdm = await ModelOdm.findByIdAndDelete(id);

    assertFound(docOdm);

    return docOdmToEntryEntity(docOdm);
  }

  async findLastByEpisodeId(episodeId: EpisodeId): Promise<Entity | null> {
    const last = await ModelOdm.findById(episodeId, {}, {
      sort: {
        "date.timestamp": -1,
      },
    } );

    if (!last)
      return null;

    return docOdmToEntryEntity(last);
  }

  async findLastByEpisodeCompKey(episodeCompKey: EpisodeCompKey): Promise<Entity | null> {
    const last = await ModelOdm.findOne( {
      episodeId: {
        code: episodeCompKey.episodeKey,
        serieId: episodeCompKey.seriesKey,
      },
    }, {}, {
      sort: {
        "date.timestamp": -1,
      },
    } );

    if (!last)
      return null;

    return docOdmToEntryEntity(last);
  }

  async findLastForSerieKey(seriesKey: SeriesKey): Promise<Entity | null> {
    const last = await ModelOdm.findOne( {
      "episodeId.serieId": seriesKey,
    }, {}, {
      sort: {
        "date.timestamp": -1,
      },
    } );

    if (!last)
      return null;

    return docOdmToEntryEntity(last);
  }

  async createNewEntryNowFor(episodeCompKey: EpisodeCompKey) {
    const newEntry: Model = createEpisodeHistoryEntryByEpisodeCompKey(episodeCompKey);

    await this.createOne(newEntry);
  }

  async addEpisodesToHistory(episodes: EpisodeEntity[]) {
    // TODO: usar bulk insert (quitar await en for)
    for (const episode of episodes)
      await this.createNewEntryNowFor(episode.compKey);
  }

  async calcEpisodeLastTimePlayedByCompKey(episodeCompKey: EpisodeCompKey): Promise<number | null> {
    const last = await this.findLastByEpisodeCompKey(episodeCompKey);

    if (last === null)
      return null;

    let lastTimePlayed = last.date.timestamp;

    if (lastTimePlayed <= 0)
      return null;

    return lastTimePlayed;
  }

  async calcEpisodeLastTimePlayedByEpisodeId(episodeId: EpisodeId): Promise<number | null> {
    const last = await this.findLastByEpisodeId(episodeId);

    if (last === null)
      return null;

    let lastTimePlayed = last.date.timestamp;

    if (lastTimePlayed <= 0)
      return null;

    return lastTimePlayed;
  }
}
