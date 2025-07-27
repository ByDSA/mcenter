import assert from "node:assert";
import { Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { CanCreateOneAndGet, CanGetAll } from "#utils/layers/repository";
import { BrokerEvent } from "#utils/message-broker";
import { Serie, SerieEntity, SeriesKey } from "../models";
import { SeriesOdm } from "./odm";
import { QUEUE_NAME } from "./events";
import { FullDocOdm, ModelOdm } from "./odm/odm";

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

    return seriesDocOdm.map(SeriesOdm.toEntity);
  }

  async createOneAndGet(model: Serie): Promise<SerieEntity> {
    const serieOdm = SeriesOdm.toDoc(model);
    const gotOdm = await ModelOdm.create(serieOdm);
    const serie = SeriesOdm.toEntity(gotOdm);
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

    return SeriesOdm.toEntity(serieDb);
  }

  async getOneOrCreate(model: Serie): Promise<SerieEntity> {
    const result = await SeriesOdm.Model.findOneAndUpdate(
      {
      // TODO: cambiar cuando DB
        id: model.key,
      },
      SeriesOdm.toDoc(model),
      {
        upsert: true, // crea si no existe
        new: true, // retorna el documento actualizado
        setDefaultsOnInsert: true, // aplica defaults solo en inserción
        includeResultMetadata: true, // para separar value y upserted
      },
    );

    assert(result.value !== null);

    const gotOdm = result.value;
    const serie = SeriesOdm.toEntity(gotOdm);

    if (result.lastErrorObject?.upserted) {
      const event = new ModelEvent(EventType.CREATED, {
        entity: serie,
      } );

      await this.domainMessageBroker.publish(QUEUE_NAME, event);
    }

    return serie;
  }
}
