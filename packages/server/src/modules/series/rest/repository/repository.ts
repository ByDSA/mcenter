import assert from "node:assert";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEventEmitter } from "#main/domain-event-emitter";
import { logDomainEvent } from "#main/logging/log-domain-event";
import { CanCreateOneAndGet, CanGetAll } from "#utils/layers/repository";
import { DomainEvent } from "#main/domain-event-emitter";
import { EmitEntityEvent } from "#main/domain-event-emitter/emit-event";
import { MongoFilterQuery, MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { Serie, SerieEntity, SeriesKey } from "../../models";
import { FullDocOdm, ModelOdm } from "./odm/odm";
import { SeriesOdm } from "./odm";
import { SeriesEvents } from "./events";

@Injectable()
export class SerieRepository
implements
CanCreateOneAndGet<SerieEntity>,
CanGetAll<SerieEntity> {
  constructor(private readonly domainEventEmitter: DomainEventEmitter) { }

  @OnEvent(SeriesEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async getAll(): Promise<SerieEntity[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(SeriesOdm.toEntity);
  }

  @EmitEntityEvent(SeriesEvents.Created.TYPE)
  async createOneAndGet(model: Serie): Promise<SerieEntity> {
    const serieOdm = SeriesOdm.toDoc(model);
    const gotOdm = await ModelOdm.create(serieOdm);

    return SeriesOdm.toEntity(gotOdm);
  }

  async getOneByKey(key: SeriesKey): Promise<SerieEntity | null> {
    const [serieDb]: FullDocOdm[] = await ModelOdm.find( {
      key,
    } );

    if (!serieDb)
      return null;

    return SeriesOdm.toEntity(serieDb);
  }

  async getOneOrCreate(model: Serie): Promise<SerieEntity> {
    const filter: MongoFilterQuery<FullDocOdm> = {
      key: model.key,
    };
    const update: MongoUpdateQuery<FullDocOdm> = {
      $setOnInsert: SeriesOdm.toDoc(model), // Solo se aplica en la creación
    };
    const result = await SeriesOdm.Model.findOneAndUpdate(
      filter,
      update,
      {
        upsert: true, // crea si no existe
        new: true, // retorna el documento actualizado
        setDefaultsOnInsert: true, // aplica defaults solo en inserción
        includeResultMetadata: true, // para separar value y upserted
      },
    );
    const gotOdm = result.value;

    assert(gotOdm !== null);
    const serie = SeriesOdm.toEntity(gotOdm);

    if (result.lastErrorObject?.upserted)
      this.domainEventEmitter.emitEntity(SeriesEvents.Created.TYPE, serie);

    return serie;
  }
}
