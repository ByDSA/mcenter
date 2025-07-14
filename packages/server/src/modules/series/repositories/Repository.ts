import { Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { CanCreateOneAndGet, CanGetAll, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { BrokerEvent } from "#utils/message-broker";
import { SerieEntity, SerieId } from "../models";
import { DocOdm, ModelOdm } from "./odm";
import { QUEUE_NAME } from "./events";
import { docOdmToEntity } from "./adapters";

@Injectable()
export class SerieRepository
implements CanGetOneById<SerieEntity, SerieId>,
CanUpdateOneByIdAndGet<SerieEntity, SerieId>,
CanCreateOneAndGet<SerieEntity>,
CanGetAll<SerieEntity> {
  constructor(private domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(QUEUE_NAME, (event: BrokerEvent<any>) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  static providers = [
    DomainMessageBroker,
  ];

  async getAll(): Promise<SerieEntity[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(docOdmToEntity) as SerieEntity[];
  }

  async createOneAndGet(model: SerieEntity): Promise<SerieEntity> {
    const serieOdm: DocOdm = await ModelOdm.create(model);
    const serie = docOdmToEntity(serieOdm);
    const event = new ModelEvent(EventType.CREATED, {
      entity: serie,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return serie as SerieEntity;
  }

  async getOneById(id: SerieId): Promise<SerieEntity | null> {
    const [serieDb]: DocOdm[] = await ModelOdm.find( {
      id,
    }, {
      _id: 0,
    } );

    if (!serieDb)
      return null;

    return docOdmToEntity(serieDb) as SerieEntity;
  }

  async updateOneByIdAndGet(id: SerieId, serie: SerieEntity): Promise<SerieEntity | null> {
    const docOdm = await ModelOdm.findOneAndUpdate( {
      id,
    }, serie, {
      new: true,
    } );

    if (!docOdm)
      return null;

    const ret = docOdmToEntity(docOdm);
    const event = new ModelEvent(EventType.UPDATED, {
      entity: ret,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return ret as SerieEntity;
  }
}
