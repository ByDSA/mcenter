import { Injectable } from "@nestjs/common";
import { assertIsSerieEntity, Serie, SeriesKey } from "$shared/models/series";
import { StreamRestDtos } from "$shared/models/streams/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { logDomainEvent } from "#main/logging/log-domain-event";
import { CanCreateOneAndGet, CanGetAll, CanGetManyByCriteria } from "#utils/layers/repository";
import { DomainEvent } from "#main/domain-event-emitter";
import { SeriesEvents } from "#modules/series/rest/repository/events";
import { EmitEntityEvent } from "#main/domain-event-emitter/emit-event";
import { Stream, StreamEntity, StreamMode, StreamOriginType } from "../../models";
import { StreamEvents } from "./events";
import { buildCriteriaPipeline } from "./odm/criteria-pipeline";
import { StreamOdm } from "./odm";

type CriteriaMany = StreamRestDtos.GetManyByCriteria.Criteria;
@Injectable()
export class StreamsRepository
implements
CanGetManyByCriteria<StreamEntity, CriteriaMany>,
CanCreateOneAndGet<StreamEntity>,
CanGetAll<StreamEntity> {
  constructor() { }

  @OnEvent(StreamEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(SeriesEvents.Created.TYPE)
  async handleCreateSerieEvent(event: SeriesEvents.Created.Event) {
    const serie = event.payload.entity;

    assertIsSerieEntity(serie);
    await this.createDefaultForSerie(serie.key);
  }

  async getManyByCriteria(criteria: CriteriaMany) {
    const pipeline = buildCriteriaPipeline(criteria);
    let got = await StreamOdm.Model.aggregate(pipeline);

    return got.map(StreamOdm.toEntity);
  }

  async createDefaultForSerieIfNeeded(seriesKey: SeriesKey): Promise<StreamEntity | null> {
    const hasDefault = await this.hasDefaultForSerie(seriesKey);

    if (!hasDefault)
      return await this.createDefaultForSerie(seriesKey);

    return null;
  }

  async getAll(): Promise<StreamEntity[]> {
    const docs = await StreamOdm.Model.find();

    return docs.map(StreamOdm.toEntity);
  }

  private async createDefaultForSerie(seriesKey: SeriesKey): Promise<StreamEntity> {
    const stream: Stream = {
      group: {
        origins: [
          {
            type: StreamOriginType.SERIE,
            id: seriesKey,
          },
        ],
      },
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

  async getOneByKey(key: StreamEntity["key"]): Promise<StreamEntity | null> {
    const docOdm = await StreamOdm.Model.findOne( {
      key,
    } );

    if (!docOdm)
      return null;

    return StreamOdm.toEntity(docOdm);
  }

  async getOneOrCreateBySeriesKey(seriesKey: Serie["key"]): Promise<StreamEntity> {
    const docOdm = await StreamOdm.Model.findOne( {
      key: seriesKey,
    } );

    if (!docOdm)
      return this.createDefaultForSerie(seriesKey);

    return StreamOdm.toEntity(docOdm);
  }
}
