import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateOneAndGet, CanGetAll, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { Event } from "#utils/message-broker";
import { Model, ModelId } from "../models";
import { docOdmToModel } from "./adapters";
import { QUEUE_NAME } from "./events";
import { DocOdm, ModelOdm } from "./odm";

const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class SeriesRepository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneByIdAndGet<Model, ModelId>,
CanCreateOneAndGet<Model>,
CanGetAll<Model>
{
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(QUEUE_NAME, (event: Event<any>) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } );
  }

  async getAll(): Promise<Model[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(docOdmToModel);
  }

  async createOneAndGet(model: Model): Promise<Model> {
    const serieOdm: DocOdm = await ModelOdm.create(model);
    const serie = docOdmToModel(serieOdm);
    const event = new ModelEvent(EventType.CREATED, {
      entity: serie,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);

    return serie;
  }

  async getOneById(id: ModelId): Promise<Model | null> {
    const [serieDB]: DocOdm[] = await ModelOdm.find( {
      id,
    }, {
      _id: 0,
    } );

    if (!serieDB)
      return null;

    return docOdmToModel(serieDB);
  }

  async updateOneByIdAndGet(id: ModelId, serie: Model): Promise<Model | null> {
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

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);

    return ret;
  }
}