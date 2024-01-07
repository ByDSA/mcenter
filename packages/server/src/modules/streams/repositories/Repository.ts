import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { SerieId } from "#modules/series";
import { SERIES_QUEUE_NAME, assertIsSerie } from "#shared/models/series";
import { LogElementResponse } from "#shared/utils/http";
import { EventType } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateOne, CanGetAll, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import { Event } from "#utils/message-broker";
import { Mode, Model, ModelId, OriginType } from "../models";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class Repository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneById<Model, ModelId>,
CanCreateOne<Model>, CanGetAll<Model> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(SERIES_QUEUE_NAME, async (event: Event<any>) => {
      logDomainEvent(SERIES_QUEUE_NAME, event);

      if (event.type === EventType.CREATED) {
        const serie = event.payload.entity;

        assertIsSerie(serie);
        await this.fixDefaultStreamForSerie(serie.id);
      }

      return Promise.resolve();
    } );
  }

  async fixDefaultStreamForSerie(serieId: SerieId): Promise<LogElementResponse | null> {
    const hasDefault = await this.hasDefaultForSerie(serieId);

    if (!hasDefault) {
      await this.createDefaultFromSerie(serieId);

      return {
        message: `Created default stream for serie ${serieId}`,
        type: "StreamCreated",
      };
    }

    return null;
  }

  async getAll(): Promise<Model[]> {
    const allStreamsDocOdm = await this.#getAllDocOdm();

    return allStreamsDocOdm.map(docOdmToModel);
  }

  async #getAllDocOdm(): Promise<DocOdm[]> {
    const allStreamsDocOdm = await ModelOdm.find( {
    }, {
      _id: 0,
    } );

    return allStreamsDocOdm;
  }

  async getManyBySerieId(id: SerieId): Promise<Model[]> {
    const allStreamsDocOdm = await this.#getAllDocOdm();
    const docsOdm = allStreamsDocOdm.filter(streamDocOdm => {
      const origins = streamDocOdm.group.origins.filter(o=>o.type === "serie" && o.id === id);

      return origins.length > 0;
    } );

    return docsOdm.map(docOdmToModel);
  }

  async createDefaultFromSerie(serieId: SerieId): Promise<void> {
    const stream: Model = {
      group: {
        origins: [
          {
            type: OriginType.SERIE,
            id: serieId,
          },
        ],
      },
      mode: Mode.SEQUENTIAL,
      id: serieId,
    };

    await this.createOne(stream);
  }

  async hasDefaultForSerie(serieId: SerieId): Promise<boolean> {
    const streamDocOdm = await ModelOdm.findOne( {
      "group.origins": {
        $elemMatch: {
          type: OriginType.SERIE,
          id: serieId,
        },
      },
    } );

    return !!streamDocOdm;
  }

  async createOne(stream: Model): Promise<void> {
    const docOdm = modelToDocOdm(stream);

    await ModelOdm.create(docOdm);
  }

  async getOneById(id: ModelId): Promise<Model | null> {
    const docOdm = await ModelOdm.findOne( {
      id,
    }, {
      _id: 0,
    } );

    if (!docOdm)
      return null;

    return docOdmToModel(docOdm);
  }

  async updateOneById(id: ModelId, stream: Model): Promise<void> {
    const docOdm = modelToDocOdm(stream);

    await ModelOdm.findOneAndUpdate( {
      id,
    }, docOdm);
  }
}