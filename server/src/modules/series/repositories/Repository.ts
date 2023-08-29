/* eslint-disable no-await-in-loop */
import { CanCreateOneAndGet, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { Model, ModelId } from "../models";
import { docOdmToModel } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

export default class Repository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneByIdAndGet<Model, ModelId>,
CanCreateOneAndGet<Model>
{
  async findOneFromGroupId(groupId: string): Promise<Model | null> {
    const groupSplit = groupId.split("/");
    const serieId = groupSplit.at(-1);

    if (!serieId)
      return null;

    const serie = await this.getOneById(serieId);

    return serie;
  }

  async createOneAndGet(model: Model): Promise<Model> {
    const serieDB: DocOdm = await ModelOdm.create(model).then(s => s.save());

    return docOdmToModel(serieDB);
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

    return docOdmToModel(docOdm);
  }
}