import assert from "node:assert";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WithOptional } from "$shared/utils/objects";
import { CanCreateOneAndGet, CanGetAll } from "#utils/layers/repository";
import { MongoFilterQuery, MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { DomainEvent } from "#core/domain-event-emitter";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { Serie, SerieEntity, SeriesKey } from "../../models";
import { SeriesEvents } from "./events";
import { SeriesOdm } from "./odm";
import { FullDocOdm, ModelOdm } from "./odm/odm";

@Injectable()
export class SeriesRepository
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

  async getOneOrCreate(createDto: WithOptional<Serie, "imageCoverId">): Promise<SerieEntity> {
    const model: Serie = {
      ...createDto,
      imageCoverId: createDto.imageCoverId ?? null,
    };
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
