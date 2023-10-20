import { HistoryList } from "#shared/models/historyLists";
import { CanCreateOne, CanGetAll, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import { Model, ModelId } from "../models";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { ModelOdm } from "./odm";

export default class Repository
implements CanUpdateOneById<Model, ModelId>,
CanGetOneById<Model, ModelId>,
CanCreateOne<Model>,
CanGetAll<Model> {
  async getAll(): Promise<Model[]> {
    const docsOdm = await ModelOdm.find( {
    }, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToModel);
  }

  async createOne(historyList: Model): Promise<void> {
    const docOdm = modelToDocOdm(historyList);

    await ModelOdm.create(docOdm);
    console.log(`History list created for ${historyList.id}`);
  }

  async #createOneDefaultModelById(id: ModelId): Promise<Model> {
    const historyList: HistoryList = {
      id,
      entries: [],
      maxSize: -1,
    };

    await this.createOne(historyList);

    return historyList;
  }

  async getOneByIdOrCreate(id: ModelId): Promise<Model> {
    const docOdm = await ModelOdm.findOne( {
      id,
    }, {
      _id: 0,
    } );

    if (docOdm)
      return docOdmToModel(docOdm);

    return this.#createOneDefaultModelById(id);
  }

  async updateOneById(id: ModelId, historyList: Model): Promise<void> {
    const docOdm = modelToDocOdm(historyList);

    await ModelOdm.findOneAndUpdate( {
      id,
    }, docOdm);
  }
}