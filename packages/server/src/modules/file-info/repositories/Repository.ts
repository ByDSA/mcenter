import { docOdmToModel, docOdmToModelWithSuperId, modelWithSuperIdToDocOdm } from "./adapters";
import { ModelOdm } from "./odm";
import { FileInfoVideo, FileInfoVideoSuperId, FileInfoVideoWithSuperId } from "#modules/file-info";
import { CanGetAllBySuperId, CanUpdateMany, CanUpdateOneBySuperId } from "#utils/layers/repository";

type ModelWithSuperId = FileInfoVideoWithSuperId;
type Model = FileInfoVideo;
type SuperId = FileInfoVideoSuperId;

export default class EpisodeFileInfoRepository
implements CanGetAllBySuperId<Model, SuperId>,
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

  async getAllBySuperId(id: SuperId): Promise<Model[]> {
    const modelsOdm = await ModelOdm.find( {
      episodeId: id,
    } );

    if (modelsOdm.length === 0)
      return [];

    return modelsOdm.map(docOdmToModel);
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
