import { CanCreateOne, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import Model, { ModelId } from "../models/Stream";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { ModelOdm } from "./odm";

export default class Repository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneById<Model, ModelId>,
CanCreateOne<Model> {
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