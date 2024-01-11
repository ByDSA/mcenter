import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { isDefined } from "#shared/utils/validation";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateOne, CanGetAll, CanGetManyCriteria } from "#utils/layers/repository";
import { FilterQuery } from "mongoose";
import { delay } from "tsyringe";
import MusicRepository from "../../repositories/Repository";
import { QUEUE_NAME } from "../events";
import { Model } from "../models";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

export type GetManyCriteria = {
  limit?: number;
  expand?: ("musics")[];
  sort?: ("asc" | "desc");
  filter?: {
    resourceId?: string;
  };
  offset?: number;
};
const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
  musicRepository: delay(()=>MusicRepository),
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class Repository
implements
CanCreateOne<Model>,
CanGetManyCriteria<Model, GetManyCriteria>,
CanGetAll<Model> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(QUEUE_NAME, (event: any) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } );
  }

  async getManyCriteria(criteria: GetManyCriteria): Promise<Model[]> {
    const findParams: FilterQuery<DocOdm> = {
    };

    if (criteria.filter?.resourceId)
      findParams.musicId = criteria.filter.resourceId;

    const query = ModelOdm.find(findParams);

    if (criteria.sort) {
      query.sort( {
        "date.timestamp": criteria.sort?.[0] === "asc" ? 1 : -1,
      } );
    }

    if (criteria.offset)
      query.skip(criteria.offset);

    if (isDefined(criteria.limit))
      query.limit(criteria.limit);

    const docsOdm = await query;

    if (docsOdm.length === 0)
      return [];

    const models = docsOdm.map(docOdmToModel);

    if (criteria.expand?.includes("musics")) {
      const promises = models.map(async (model) => {
        const { resourceId } = model;
        const resource = await this.#deps.musicRepository.getOneById(resourceId);

        if (resource)
          // eslint-disable-next-line no-param-reassign
          model.resource = resource;
      } );

      await Promise.all(promises);
    }

    return models;
  }

  async getAll(): Promise<Model[]> {
    const docsOdm = await ModelOdm.find( {
    }, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToModel);
  }

  async getLast(): Promise<Model | null> {
    const docsOdm = await ModelOdm.find( {
    }, {
      _id: 0,
    } ).sort( {
      "date.timestamp": -1,
    } )
      .limit(1);

    if (docsOdm.length === 0)
      return null;

    return docOdmToModel(docsOdm[0]);
  }

  async createOne(model: Model): Promise<void> {
    const docOdm = modelToDocOdm(model);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<Model>(EventType.CREATED, {
      entity: model,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
  }
}