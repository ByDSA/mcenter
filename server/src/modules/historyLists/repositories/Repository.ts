import { CanCreateOne, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import { Model, ModelId } from "../models";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { ModelOdm } from "./odm";

export default class Repository
implements CanUpdateOneById<Model, ModelId>,
CanGetOneById<Model, ModelId>,
CanCreateOne<Model> {
  async createOne(historyList: Model): Promise<void> {
    const docOdm = modelToDocOdm(historyList);

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

  async updateOneById(id: ModelId, historyList: Model): Promise<void> {
    const docOdm = modelToDocOdm(historyList);

    await ModelOdm.findOneAndUpdate( {
      id,
    }, docOdm);
  }
}