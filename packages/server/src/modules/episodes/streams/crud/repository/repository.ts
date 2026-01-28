import { Injectable } from "@nestjs/common";
import { Serie, serieEntitySchema, SeriesKey } from "$shared/models/series";
import { StreamCrudDtos } from "$shared/models/streams/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { Stream, StreamEntity, StreamMode, StreamOriginType } from "../../models";
import { StreamEvents } from "./events";
import { buildCriteriaPipeline } from "./odm/criteria-pipeline";
import { StreamOdm } from "./odm";
import { CanCreateOneAndGet, CanGetAll, CanGetManyByCriteria } from "#utils/layers/repository";
import { SeriesEvents } from "#episodes/series/crud/repository/events";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { DomainEvent } from "#core/domain-event-emitter";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { UsersRepository } from "#core/auth/users/crud/repository";

type CriteriaMany = StreamCrudDtos.GetManyByCriteria.Criteria;
@Injectable()
export class StreamsRepository
implements
CanGetManyByCriteria<StreamEntity, CriteriaMany>,
CanCreateOneAndGet<StreamEntity>,
CanGetAll<StreamEntity> {
  constructor(
    private readonly usersRepo: UsersRepository,
  ) { }

  @OnEvent(StreamEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(SeriesEvents.Created.TYPE)
  async handleCreateSerieEvent(event: SeriesEvents.Created.Event) {
    const serie = event.payload.entity;

    serieEntitySchema.parse(serie);

    // TODO: mejor crear el stream al vuelo cuando se vaya a usar,
    // puede haber muchos users que ni la usen
    for (const user of await this.usersRepo.getAll())
      await this.createDefaultForSerie(user.id, serie.key);
  }

  async getManyByCriteria(criteria: CriteriaMany) {
    const pipeline = buildCriteriaPipeline(criteria);
    let got = await StreamOdm.Model.aggregate(pipeline);

    return got.map(StreamOdm.toEntity);
  }

  async createDefaultForSerieIfNeeded(
    userId: string,
    seriesKey: SeriesKey,
  ): Promise<StreamEntity | null> {
    const hasDefault = await this.hasDefaultForSerie(seriesKey);

    if (!hasDefault)
      return await this.createDefaultForSerie(userId, seriesKey);

    return null;
  }

  async getOneById(id: string): Promise<StreamEntity | null> {
    const doc = await StreamOdm.Model.findById(id);

    if (!doc)
      return null;

    return StreamOdm.toEntity(doc);
  }

  async getAll(): Promise<StreamEntity[]> {
    const docs = await StreamOdm.Model.find();

    return docs.map(StreamOdm.toEntity);
  }

  private async createDefaultForSerie(userId: string, seriesKey: SeriesKey): Promise<StreamEntity> {
    const stream: Stream = {
      group: {
        origins: [
          {
            type: StreamOriginType.SERIE,
            id: seriesKey,
          },
        ],
      },
      userId,
      mode: StreamMode.SEQUENTIAL,
      key: seriesKey,
    };

    return await this.createOneAndGet(stream);
  }

  async hasDefaultForSerie(seriesKey: SeriesKey): Promise<boolean> {
    const streamDocOdm = await StreamOdm.Model.findOne( {
      "group.origins": {
        $elemMatch: {
          type: StreamOriginType.SERIE,
          id: seriesKey,
        },
      },
    } );

    return !!streamDocOdm;
  }

  @EmitEntityEvent(StreamEvents.Created.TYPE)
  async createOneAndGet(stream: Stream): Promise<StreamEntity> {
    const docOdm = StreamOdm.toDoc(stream);
    const [got]: StreamOdm.FullDoc[] = await StreamOdm.Model.create([docOdm], {
      new: true,
    } );

    return StreamOdm.toEntity(got);
  }

  async getOneByKey(userId: string, key: StreamEntity["key"]): Promise<StreamEntity | null> {
    const docOdm = await StreamOdm.Model.findOne( {
      key,
      userId,
    } );

    if (!docOdm)
      return null;

    return StreamOdm.toEntity(docOdm);
  }

  async getOneOrCreateBySeriesKey(userId: string, seriesKey: Serie["key"]): Promise<StreamEntity> {
    const docOdm = await StreamOdm.Model.findOne( {
      key: seriesKey,
    } );

    if (!docOdm)
      return this.createDefaultForSerie(userId, seriesKey);

    return StreamOdm.toEntity(docOdm);
  }
}
