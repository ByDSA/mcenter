import { SerieId } from "#modules/series";
import { CanCreateOne, CanGetAll, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import { Model, ModelId, OriginType, Mode as StreamMode } from "../models";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

export default class Repository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneById<Model, ModelId>,
CanCreateOne<Model>, CanGetAll<Model> {
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
      mode: StreamMode.SEQUENTIAL,
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
    console.log(`getting stream by id=${id}`);
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