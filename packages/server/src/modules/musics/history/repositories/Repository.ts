import { showError } from "#shared/utils/errors/showError";
import { isDefined } from "#shared/utils/validation";
import { FilterQuery } from "mongoose";
import { delay } from "tsyringe";
import { CanCreateOne, CanGetAll, CanGetManyCriteria } from "#utils/layers/repository";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { MusicHistoryEntry } from "#musics/history/models";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { QUEUE_NAME } from "../events";
import { MusicRepository } from "../../repositories/Repository";
import { DocOdm, ModelOdm } from "./odm";
import { docOdmToModel, modelToDocOdm } from "./adapters";

export type GetManyCriteria = {
  limit?: number;
  expand?: ("musics")[];
  sort?: ("asc" | "desc");
  filter?: {
    resourceId?: string;
    timestampMax?: number;
  };
  offset?: number;
};
const DEPS_MAP = {
  domainMessageBroker: DomainMessageBroker,
  musicRepository: delay(()=>MusicRepository),
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class MusicHistoryRepository
implements
CanCreateOne<MusicHistoryEntry>,
CanGetManyCriteria<MusicHistoryEntry, GetManyCriteria>,
CanGetAll<MusicHistoryEntry> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(QUEUE_NAME, (event: any) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  async getManyCriteria(criteria: GetManyCriteria): Promise<MusicHistoryEntry[]> {
    const findParams: FilterQuery<DocOdm> = {};

    if (criteria.filter?.resourceId)
      findParams.musicId = criteria.filter.resourceId;

    if (criteria.filter?.timestampMax) {
      findParams["date.timestamp"] = {
        $lte: criteria.filter.timestampMax,
      };
    }

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

          model.resource = resource;
      } );

      await Promise.all(promises);
    }

    return models;
  }

  async getAll(): Promise<MusicHistoryEntry[]> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToModel);
  }

  async #getLastOdm(): Promise<DocOdm | null> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } ).sort( {
      "date.timestamp": -1,
    } )
      .limit(1);

    if (docsOdm.length === 0)
      return null;

    return docsOdm[0];
  }

  async getLast(): Promise<MusicHistoryEntry | null> {
    const docOdm = await this.#getLastOdm();

    if (!docOdm)
      return null;

    return docOdmToModel(docOdm);
  }

  async createOne(model: MusicHistoryEntry): Promise<void> {
    const lastOdm = await this.#getLastOdm();

    if (lastOdm?.musicId === model.resourceId)
      return;

    const docOdm = modelToDocOdm(model);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<MusicHistoryEntry>(EventType.CREATED, {
      entity: model,
    } );

    await this.#deps.domainMessageBroker.publish(QUEUE_NAME, event);
  }
}
