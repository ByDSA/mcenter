import { Injectable } from "@nestjs/common";
import { FileInfoVideo, FileInfoVideoSuperId, FileInfoVideoWithSuperId } from "#episodes/file-info/models";
import { CanGetAllBySuperId, CanUpdateMany, CanUpdateOneBySuperId } from "#utils/layers/repository";
import { ModelOdm, docOdmToModel, docOdmToModelWithSuperId, modelWithSuperIdToDocOdm } from "./odm";

type ModelWithSuperId = FileInfoVideoWithSuperId;
type Model = FileInfoVideo;
type SuperId = FileInfoVideoSuperId;

@Injectable()
export class EpisodeFileInfoRepository
implements CanGetAllBySuperId<Model, SuperId>,
CanUpdateMany<ModelWithSuperId>, CanUpdateOneBySuperId<ModelWithSuperId, SuperId> {
  async updateOneByEpisodeDbId(id: string, model: ModelWithSuperId): Promise<void> {
    const docOdm = modelWithSuperIdToDocOdm(model);

    await ModelOdm.updateOne( {
      episodeId: id,
    }, docOdm, {
      upsert: true,
    } );
  }

  async updateMany(models: ModelWithSuperId[]): Promise<void> {
    const promises = models.map(model =>this.updateOneByEpisodeDbId(model.episodeId, model));

    await Promise.all(promises);
  }

  async getAllByEpisodeDbId(id: SuperId): Promise<Model[]> {
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
