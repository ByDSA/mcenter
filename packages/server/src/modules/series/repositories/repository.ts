import { Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { Serie, SerieEntity, SeriesKey } from "../models";
import { FullDocOdm, ModelOdm } from "./odm/odm";
import { QUEUE_NAME } from "./events";
import { SeriesOdm } from "./odm";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { CanCreateOneAndGet, CanGetAll } from "#utils/layers/repository";
import { BrokerEvent } from "#utils/message-broker";

@Injectable()
export class SerieRepository
implements
CanCreateOneAndGet<SerieEntity>,
CanGetAll<SerieEntity> {
  constructor(private readonly domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(QUEUE_NAME, (event: BrokerEvent<any>) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  async getAll(): Promise<SerieEntity[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(SeriesOdm.docToEntity);
  }

  async createOneAndGet(model: Serie): Promise<SerieEntity> {
    const serieOdm = SeriesOdm.toDoc(model);
    const gotOdm = await ModelOdm.create(serieOdm);
    const serie = SeriesOdm.docToEntity(gotOdm);
    const event = new ModelEvent(EventType.CREATED, {
      entity: serie,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return serie;
  }

  async getOneByKey(key: SeriesKey): Promise<SerieEntity | null> {
    const [serieDb]: FullDocOdm[] = await ModelOdm.find( {
      id: key,
    } );

    if (!serieDb)
      return null;

    return SeriesOdm.docToEntity(serieDb);
  }

  async updateOneByKeyAndGet(key: SeriesKey, serie: SerieEntity): Promise<SerieEntity | null> {
    const docOdm = await ModelOdm.findOneAndUpdate( {
      id: key,
    }, serie, {
      new: true,
    } );

    if (!docOdm)
      return null;

    const ret = SeriesOdm.docToEntity(docOdm);
    const event = new ModelEvent(EventType.UPDATED, {
      entity: ret,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return ret;
  }
}
