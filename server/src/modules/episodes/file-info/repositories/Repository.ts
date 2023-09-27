import { CanGetAllBySuperId, CanUpdateMany, CanUpdateOneBySuperId } from "#utils/layers/repository";
import { ModelWithSuperId, SuperId } from "../models";
import { docOdmToModelWithSuperId, modelWithSuperIdToDocOdm } from "./adapters";
import { ModelOdm } from "./odm";

export default class Repository
implements CanGetAllBySuperId<ModelWithSuperId, SuperId>,
CanUpdateMany<ModelWithSuperId>, CanUpdateOneBySuperId<ModelWithSuperId, SuperId> {
  async updateOneBySuperId(id: string, model: ModelWithSuperId): Promise<void> {
    const docOdm = modelWithSuperIdToDocOdm(model);

    await ModelOdm.updateOne( {
      episodeId: id,
    }, docOdm, {
      upsert: true,
    } );
  }

  async updateMany(models: ModelWithSuperId[]): Promise<void> {
    const promises = models.map(model =>this.updateOneBySuperId(model.episodeId, model));

    await Promise.all(promises);
  }

  async getAllBySuperId(id: SuperId): Promise<ModelWithSuperId[]> {
    const modelsOdm = await ModelOdm.find( {
      episodeId: id,
    } );

    if (modelsOdm.length === 0)
      return [];

    return modelsOdm.map(docOdmToModelWithSuperId);
  }

  async getOneByPath(path: string): Promise<ModelWithSuperId | null> {
    const modelOdm = await ModelOdm.findOne( {
      path,
    } );

    if (!modelOdm)
      return null;

    return docOdmToModelWithSuperId(modelOdm);
  }
}