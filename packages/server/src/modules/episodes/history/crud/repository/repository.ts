import type { EpisodeEntity } from "#episodes/models";
import type { EpisodeHistoryEntryEntity as Entity, EpisodeHistoryEntryEntity } from "../../models";
import type { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { OnEvent } from "@nestjs/event-emitter";
import { Types } from "mongoose";
import { type DomainEvent, DomainEventEmitter } from "#core/domain-event-emitter";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { SeriesKey } from "#episodes/series";
import { StreamEntity } from "#episodes/streams";
import { MongoFilterQuery, MongoSortQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { StreamsRepository } from "#episodes/streams/crud/repository";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { EpisodeHistoryEntryOdm } from "./odm";
import { EpisodeHistoryEntryEvents } from "./events";
import { getCriteriaPipeline } from "./criteria-pipeline";

type FindLastProps = {
  streamId: StreamEntity["id"];
};

type Options = {
  requestingUserId: string;
};

type Id = EpisodeHistoryEntryEntity["id"];
type EpisodeId = EpisodeEntity["id"];

type AddEpisodesToHistoryProps = {
  episodes: EpisodeEntity[];
  streamId: StreamEntity["id"];
};
type CreateNewEntryNowForProps = {
  episodeId: EpisodeEntity["id"];
  seriesId: string;
  streamId?: StreamEntity["id"];
};
@Injectable()
export class EpisodeHistoryRepository {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    private readonly streamsRepo: StreamsRepository,
  ) {}

  @OnEvent(EpisodeHistoryEntryEvents.WILDCARD)
  handleEvents(ev: DomainEvent<object>) {
    logDomainEvent(ev);
  }

  @EmitEntityEvent(EpisodeHistoryEntryEvents.Created.TYPE)
  async createOneAndGet(
    entry: EpisodeHistoryEntryCrudDtos.CreateOne.Body,
    options: Options,
  ): Promise<EpisodeHistoryEntryEntity> {
    const entryDocOdm = EpisodeHistoryEntryOdm.toDoc( {
      ...entry,
      userId: options.requestingUserId,
    } );
    const created = await EpisodeHistoryEntryOdm.Model.create(entryDocOdm);

    return EpisodeHistoryEntryOdm.toEntity(created);
  }

  async getAll(options: Options): Promise<Entity[]> {
    const docsOdm = await EpisodeHistoryEntryOdm.Model.find( {
      userId: options.requestingUserId,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(EpisodeHistoryEntryOdm.toEntity);
  }

  async getManyBySeriesId(seriesId: SeriesKey, options: Options): Promise<Entity[]> {
    return await this.getManyByCriteria( {
      filter: {
        seriesId,
      },
      expand: ["episodes"],
    }, options);
  }

  async getManyByCriteria(
    criteria: EpisodeHistoryEntryCrudDtos.GetMany.Criteria,
    options: Options,
  ): Promise<Entity[]> {
    criteria.filter = {
      ...criteria.filter,
      userId: options.requestingUserId,
    };
    const pipeline = getCriteriaPipeline(criteria);
    const docsOdm: EpisodeHistoryEntryOdm.FullDoc[] = await EpisodeHistoryEntryOdm.Model.aggregate(
      pipeline,
    );

    if (docsOdm.length === 0)
      return [];

    if (criteria.expand?.includes("episodesSeries"))
      assertIsDefined(docsOdm[0].episode?.series, "Lookup series failed");

    if (criteria.expand?.includes("episodesUserInfo"))
      assertIsDefined(docsOdm[0].episode?.userInfo, "Lookup series failed");

    if (criteria.expand?.includes("episodes"))
      assertIsDefined(docsOdm[0].episode, "Lookup episode failed");

    if (criteria.expand?.includes("episodesFileInfos"))
      assertIsDefined(docsOdm[0].episode!.fileInfos, "Lookup episode file info failed");

    return docsOdm.map(EpisodeHistoryEntryOdm.toEntity);
  }

  @EmitEntityEvent(EpisodeHistoryEntryEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: Id, options: Options): Promise<Entity> {
    const docOdm = await EpisodeHistoryEntryOdm.Model.findByIdAndDelete(id, {
      userId: new Types.ObjectId(options.requestingUserId),
    } );

    assertFoundClient(docOdm);

    return EpisodeHistoryEntryOdm.toEntity(docOdm);
  }

  async deleteAllAndGet(options: Options): Promise<Entity[]> {
    const filter = {
      userId: new Types.ObjectId(options.requestingUserId),
    };
    const docs = await EpisodeHistoryEntryOdm.Model.find(filter);

    await EpisodeHistoryEntryOdm.Model.deleteMany(filter);

    const ret = docs.map(EpisodeHistoryEntryOdm.toEntity);

    for (const e of ret) {
      this.domainEventEmitter.emitEntity(EpisodeHistoryEntryEvents.Deleted.TYPE, {
        ...e,
        id: e.id,
      } );
    }

    return ret;
  }

  async findLastByEpisodeId(episodeId: EpisodeId, options: Options): Promise<Entity | null> {
    const sort = {
      date: -1,
    } satisfies MongoSortQuery<EpisodeHistoryEntryOdm.Doc>;
    const last = await EpisodeHistoryEntryOdm.Model
      .findOne( {
        episodeId: new Types.ObjectId(episodeId),
        userId: new Types.ObjectId(options.requestingUserId),
      } )
      .sort(sort);

    if (!last)
      return null;

    return EpisodeHistoryEntryOdm.toEntity(last);
  }

  async findLast( { streamId }: FindLastProps, options: Options): Promise<Entity | null> {
    const filter = {
      streamId,
      userId: new Types.ObjectId(options.requestingUserId),
    } satisfies MongoFilterQuery<EpisodeHistoryEntryOdm.Doc>;
    const sort = {
      date: -1,
    } satisfies MongoSortQuery<EpisodeHistoryEntryOdm.Doc>;
    const last = await EpisodeHistoryEntryOdm.Model
      .findOne(filter)
      .sort(sort);

    if (!last)
      return null;

    return EpisodeHistoryEntryOdm.toEntity(last);
  }

  async isLast(episodeId: EpisodeEntity["id"], options: Options): Promise<boolean> {
    const lastOdm = await EpisodeHistoryEntryOdm.Model.findOne( {
      userId: new Types.ObjectId(options.requestingUserId),
    } ).sort( {
      date: -1,
    } );

    return lastOdm?.episodeId.toString() === episodeId;
  }

  async createNewEntryNowFor(
    { episodeId, seriesId, streamId }: CreateNewEntryNowForProps,
    options: Options,
  ) {
    if (streamId === undefined) {
      const series = await SeriesOdm.Model.findById(seriesId);

      assertFoundServer(series);
      const defaultStream = this.streamsRepo.getOneOrCreateBySeriesId(
        options.requestingUserId,
        series.id,
      );

      streamId = (await defaultStream).id;
    }

    const newEntry: EpisodeHistoryEntryCrudDtos.CreateOne.Body = {
      date: new Date(),
      resourceId: episodeId,
      streamId,
    };

    return await this.createOneAndGet(newEntry, options);
  }

  async addEpisodesToHistory( { episodes, streamId }: AddEpisodesToHistoryProps, options: Options) {
    // TODO: usar bulk insert (quitar await en for)
    for (const episode of episodes) {
      await this.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
        streamId,
      }, options);
    }
  }
}
