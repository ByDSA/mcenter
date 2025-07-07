import { showError } from "#shared/utils/errors/showError";
import { Injectable } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { CanCreateOneAndGet, CanGetAll, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { Event } from "#utils/message-broker";
import { Serie, SerieId } from "../models";
import { DocOdm, ModelOdm } from "./odm";
import { QUEUE_NAME } from "./events";
import { docOdmToModel } from "./adapters";

@Injectable()
export class SerieRepository
implements CanGetOneById<Serie, SerieId>,
CanUpdateOneByIdAndGet<Serie, SerieId>,
CanCreateOneAndGet<Serie>,
CanGetAll<Serie> {
  constructor(private domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(QUEUE_NAME, (event: Event<any>) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  async getAll(): Promise<Serie[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(docOdmToModel);
  }

  async createOneAndGet(model: Serie): Promise<Serie> {
    const serieOdm: DocOdm = await ModelOdm.create(model);
    const serie = docOdmToModel(serieOdm);
    const event = new ModelEvent(EventType.CREATED, {
      entity: serie,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return serie;
  }

  async getOneById(id: SerieId): Promise<Serie | null> {
    const [serieDb]: DocOdm[] = await ModelOdm.find( {
      id,
    }, {
      _id: 0,
    } );

    if (!serieDb)
      return null;

    return docOdmToModel(serieDb);
  }

  async updateOneByIdAndGet(id: SerieId, serie: Serie): Promise<Serie | null> {
    const docOdm = await ModelOdm.findOneAndUpdate( {
      id,
    }, serie, {
      new: true,
    } );

    if (!docOdm)
      return null;

    const ret = docOdmToModel(docOdm);
    const event = new ModelEvent(EventType.UPDATED, {
      entity: ret,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return ret;
  }
}
