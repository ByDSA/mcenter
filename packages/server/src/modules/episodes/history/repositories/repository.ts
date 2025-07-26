import type { EpisodeCompKey, EpisodeEntity } from "#episodes/models";
import type { BrokerEvent } from "#utils/message-broker";
import type { CanCreateOne, CanDeleteOneByIdAndGet } from "#utils/layers/repository";
import type { EpisodeHistoryEntry as Model, EpisodeHistoryEntryEntity as Entity, EpisodeHistoryEntryEntity } from "../models";
import type { EpisodeHistoryEntryRestDtos } from "$shared/models/episodes/history/dto/transport";
import { showError } from "$shared/utils/errors/showError";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { createEpisodeHistoryEntry } from "$shared/models/episodes/history/utils";
import { EventType, ModelEvent, ModelMessage } from "#utils/event-sourcing";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { assertFound } from "#utils/validation/found";
import { SeriesKey } from "#modules/series";
import { StreamEntity } from "#modules/streams";
import { EpisodeHistoryEntryOdm } from "./odm";
import { EPISODE_HISTORY_ENTRIES_QUEUE_NAME } from "./events";
import { getCriteriaPipeline } from "./criteria-pipeline";

type FindLastProps = {
  seriesKey: SeriesKey;
  streamId: StreamEntity["id"];
};

export type EpisodeHistoryEntryEvent = BrokerEvent<ModelMessage<EpisodeHistoryEntryEntity>>;

type Id = EpisodeHistoryEntryEntity["id"];
type EpisodeId = EpisodeEntity["id"];

type AddEpisodesToHistoryProps = {
  episodes: EpisodeEntity[];
  streamId: StreamEntity["id"];
};
type CreateNewEntryNowForProps = {
  episodeCompKey: EpisodeCompKey;
  streamId: StreamEntity["id"];
};
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
    const entryDocOdm = EpisodeHistoryEntryOdm.toDoc(entry);

    await EpisodeHistoryEntryOdm.Model.create(entryDocOdm);

    const event = new ModelEvent<Model>(EventType.CREATED, {
      entity: entry,
    } );

    await this.domainMessageBroker.publish(EPISODE_HISTORY_ENTRIES_QUEUE_NAME, event);
  }

  async getAll(): Promise<Entity[]> {
    const docsOdm = await EpisodeHistoryEntryOdm.Model.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(EpisodeHistoryEntryOdm.toEntity);
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
    const docsOdm: EpisodeHistoryEntryOdm.FullDoc[] = await EpisodeHistoryEntryOdm.Model.aggregate(
      pipeline,
    );

    if (docsOdm.length === 0)
      return [];

    if (criteria.expand?.includes("series"))
      assertIsDefined(docsOdm[0].serie, "Lookup serie failed");

    if (criteria.expand?.includes("episodes"))
      assertIsDefined(docsOdm[0].episode, "Lookup episode failed");

    if (criteria.expand?.includes("episode-file-infos"))
      assertIsDefined(docsOdm[0].episode!.fileInfos, "Lookup episode file info failed");

    return docsOdm.map(EpisodeHistoryEntryOdm.toEntity);
  }

  async deleteOneByIdAndGet(id: Id): Promise<Entity> {
    const docOdm = await EpisodeHistoryEntryOdm.Model.findByIdAndDelete(id);

    assertFound(docOdm);

    return EpisodeHistoryEntryOdm.toEntity(docOdm);
  }

  async findLastByEpisodeId(episodeId: EpisodeId): Promise<Entity | null> {
    const last = await EpisodeHistoryEntryOdm.Model.findById(episodeId, {}, {
      sort: {
        "date.timestamp": -1,
      },
    } );

    if (!last)
      return null;

    return EpisodeHistoryEntryOdm.toEntity(last);
  }

  async findLastByEpisodeCompKey(episodeCompKey: EpisodeCompKey): Promise<Entity | null> {
    const last = await EpisodeHistoryEntryOdm.Model.findOne( {
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

    return EpisodeHistoryEntryOdm.toEntity(last);
  }

  async findLast( { seriesKey, streamId }: FindLastProps): Promise<Entity | null> {
    const last = await EpisodeHistoryEntryOdm.Model.findOne( {
      "episodeId.serieId": seriesKey,
      streamId,
    }, {}, {
      sort: {
        "date.timestamp": -1,
      },
    } );

    if (!last)
      return null;

    return EpisodeHistoryEntryOdm.toEntity(last);
  }

  async createNewEntryNowFor( { episodeCompKey, streamId }: CreateNewEntryNowForProps) {
    const newEntry: Model = createEpisodeHistoryEntry(episodeCompKey, streamId);

    await this.createOne(newEntry);
  }

  async addEpisodesToHistory( { episodes, streamId }: AddEpisodesToHistoryProps) {
    // TODO: usar bulk insert (quitar await en for)
    for (const episode of episodes) {
      await this.createNewEntryNowFor( {
        episodeCompKey: episode.compKey,
        streamId,
      } );
    }
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
