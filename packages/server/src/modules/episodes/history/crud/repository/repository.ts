import type { EpisodeEntity } from "#episodes/models";
import type { DomainEvent } from "#core/domain-event-emitter";
import type { CanCreateOne, CanDeleteOneByIdAndGet } from "#utils/layers/repository";
import type { EpisodeHistoryEntry as Model, EpisodeHistoryEntryEntity as Entity, EpisodeHistoryEntryEntity } from "../../models";
import type { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { OnEvent } from "@nestjs/event-emitter";
import { getDateNow } from "$shared/utils/time";
import { UserEntity } from "$shared/models/auth";
import { assertFoundClient } from "#utils/validation/found";
import { SeriesKey } from "#episodes/series";
import { StreamEntity } from "#episodes/streams";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { EpisodeHistoryEntryOdm } from "./odm";
import { EpisodeHistoryEntryEvents } from "./events";
import { getCriteriaPipeline } from "./criteria-pipeline";

type FindLastProps = {
  streamId: StreamEntity["id"];
};

type Id = EpisodeHistoryEntryEntity["id"];
type EpisodeId = EpisodeEntity["id"];

type AddEpisodesToHistoryProps = {
  episodes: EpisodeEntity[];
  streamId: StreamEntity["id"];
  userId: UserEntity["id"];
};
type CreateNewEntryNowForProps = {
  episode: EpisodeEntity;
  streamId?: StreamEntity["id"];
  userId: UserEntity["id"];
};
@Injectable()
export class EpisodeHistoryRepository implements
CanCreateOne<Model>,
CanDeleteOneByIdAndGet<Model, Id> {
  constructor(
    private readonly streamsRepo: StreamsRepository,
  ) {}

  @OnEvent(EpisodeHistoryEntryEvents.WILDCARD)
  handleEvents(ev: DomainEvent<object>) {
    logDomainEvent(ev);
  }

  @EmitEntityEvent(EpisodeHistoryEntryEvents.Created.TYPE)
  async createOne(entry: Model): Promise<void> {
    const entryDocOdm = EpisodeHistoryEntryOdm.toDoc(entry);

    await EpisodeHistoryEntryOdm.Model.create(entryDocOdm);
  }

  async getAll(): Promise<Entity[]> {
    const docsOdm = await EpisodeHistoryEntryOdm.Model.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(EpisodeHistoryEntryOdm.toEntity);
  }

  async getManyBySeriesKey(userId: string, seriesKey: SeriesKey): Promise<Entity[]> {
    return await this.getManyByCriteria( {
      filter: {
        userId,
        seriesKey,
      },
      expand: ["episodes"],
    } );
  }

  async getManyByCriteria(
    criteria: EpisodeHistoryEntryCrudDtos.GetManyByCriteria.Criteria,
  ): Promise<Entity[]> {
    const pipeline = getCriteriaPipeline(criteria);
    const docsOdm: EpisodeHistoryEntryOdm.FullDoc[] = await EpisodeHistoryEntryOdm.Model.aggregate(
      pipeline,
    );

    if (docsOdm.length === 0)
      return [];

    if (criteria.expand?.includes("episodesSeries"))
      assertIsDefined(docsOdm[0].episode?.serie, "Lookup serie failed");

    if (criteria.expand?.includes("episodesUserInfo"))
      assertIsDefined(docsOdm[0].episode?.userInfo, "Lookup serie failed");

    if (criteria.expand?.includes("episodes"))
      assertIsDefined(docsOdm[0].episode, "Lookup episode failed");

    if (criteria.expand?.includes("episodesFileInfos"))
      assertIsDefined(docsOdm[0].episode!.fileInfos, "Lookup episode file info failed");

    return docsOdm.map(EpisodeHistoryEntryOdm.toEntity);
  }

  @EmitEntityEvent(EpisodeHistoryEntryEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: Id): Promise<Entity> {
    const docOdm = await EpisodeHistoryEntryOdm.Model.findByIdAndDelete(id);

    assertFoundClient(docOdm);

    return EpisodeHistoryEntryOdm.toEntity(docOdm);
  }

  async findLastByEpisodeId(episodeId: EpisodeId): Promise<Entity | null> {
    const sort = {
      "date.timestamp": -1,
    } satisfies MongoSortQuery<EpisodeHistoryEntryOdm.Doc>;
    const last = await EpisodeHistoryEntryOdm.Model.findById(episodeId, {}, {
      sort,
    } );

    if (!last)
      return null;

    return EpisodeHistoryEntryOdm.toEntity(last);
  }

  async findLast( { streamId }: FindLastProps): Promise<Entity | null> {
    const filter = {
      streamId,
    } satisfies MongoFilterQuery<EpisodeHistoryEntryOdm.Doc>;
    const sort = {
      "date.timestamp": -1,
    } satisfies MongoSortQuery<EpisodeHistoryEntryOdm.Doc>;
    const last = await EpisodeHistoryEntryOdm.Model.findOne(filter, {}, {
      sort,
    } );

    if (!last)
      return null;

    return EpisodeHistoryEntryOdm.toEntity(last);
  }

  async isLast(episodeId: EpisodeEntity["id"], userId: string): Promise<boolean> {
    const lastOdm = await EpisodeHistoryEntryOdm.Model.findOne( {
      userId,
    } ).sort( {
      "date.timestamp": -1,
    } );

    return lastOdm?.episodeId.toString() === episodeId;
  }

  async createNewEntryNowFor( { episode, streamId, userId }: CreateNewEntryNowForProps) {
    assertIsDefined(userId);

    if (streamId === undefined) {
      const defaultStream = this.streamsRepo.getOneOrCreateBySeriesKey(
        userId,
        episode.compKey.seriesKey,
      );

      streamId = (await defaultStream).id;
    }

    const newEntry: Model = {
      date: getDateNow(),
      resourceId: episode.id,
      streamId,
      userId,
    };

    await this.createOne(newEntry);
  }

  async addEpisodesToHistory( { episodes, streamId, userId }: AddEpisodesToHistoryProps) {
    // TODO: usar bulk insert (quitar await en for)
    for (const episode of episodes) {
      await this.createNewEntryNowFor( {
        episode,
        streamId,
        userId,
      } );
    }
  }

  async calcEpisodeLastTimePlayedById(episodeId: EpisodeEntity["id"]): Promise<number | null> {
    const last = await this.findLastByEpisodeId(episodeId);

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
