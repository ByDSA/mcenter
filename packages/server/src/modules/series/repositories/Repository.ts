import { showError } from "#shared/utils/errors/showError";
import { Serie, SerieId } from "../models";
import { docOdmToModel } from "./adapters";
import { QUEUE_NAME } from "./events";
import { DocOdm, ModelOdm } from "./odm";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateOneAndGet, CanGetAll, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { Event } from "#utils/message-broker";

const DEPS_MAP = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class SerieRepository
implements CanGetOneById<Serie, SerieId>,
CanUpdateOneByIdAndGet<Serie, SerieId>,
CanCreateOneAndGet<Serie>,
CanGetAll<Serie> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(QUEUE_NAME, (event: Event<any>) => {
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

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);

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

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);

    return ret;
  }
}
