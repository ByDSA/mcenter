import { Injectable } from "@nestjs/common";
import { FileInfoVideoEntity } from "#episodes/file-info/models";
import { CanGetAllBySuperId, CanUpdateMany, } from "#utils/layers/repository";
import { ModelOdm, docOdmToModelWithSuperId, modelToDocOdm } from "./odm";

type Entity = FileInfoVideoEntity;
type EpisodeId = string;

@Injectable()
export class EpisodeFileInfoRepository
implements
CanGetAllBySuperId<Entity, EpisodeId>,
CanUpdateMany<Entity> {
  async updateOneByEpisodeId(id: string, model: Entity): Promise<void> {
    const docOdm = modelToDocOdm(model);

    await ModelOdm.updateOne( {
      episodeId: id,
    }, docOdm, {
      upsert: true,
    } );
  }

  async updateMany(models: Entity[]): Promise<void> {
    const promises = models.map(model =>this.updateOneByEpisodeId(model.episodeId, model));

    await Promise.all(promises);
  }

  async getAllByEpisodeId(id: EpisodeId): Promise<Entity[]> {
    const modelsOdm = await ModelOdm.find( {
      episodeId: id,
    } );

    if (modelsOdm.length === 0)
      return [];

    return modelsOdm.map(docOdmToModelWithSuperId);
  }

  async getOneByPath(path: string): Promise<Entity | null> {
    const modelOdm = await ModelOdm.findOne( {
      path,
    } );

    if (!modelOdm)
      return null;

    return docOdmToModelWithSuperId(modelOdm);
  }
}
