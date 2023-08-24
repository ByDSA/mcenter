import { HistoryList } from "#modules/historyLists";
import { CanCreateManyAndGet, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import Model, { ModelFullId } from "../models/Episode";
import { docOdmToModel, modelToDocOdm } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

type UpdateOneParams = Model;

export default class Repository
implements CanGetOneById<Model, ModelFullId>,
CanUpdateOneByIdAndGet<Model, ModelFullId>,
CanCreateManyAndGet<Model>
{
  async findLastEpisodeInHistoryList(historyList: HistoryList): Promise<Model | null> {
    const historyEntry = historyList.entries.at(-1);

    if (!historyEntry)
      return null;

    const {episodeId, serieId} = historyEntry;

    if (!episodeId || !serieId)
      return null;

    const fullId: ModelFullId = {
      episodeId,
      serieId,
    };

    return this.getOneById(fullId);
  }

  async getOneById(fullId: ModelFullId): Promise<Model | null> {
    const episodeOdm = await ModelOdm.findOne( {
      serieId: fullId.serieId,
      episodeId: fullId.episodeId,
    } );

    if (!episodeOdm)
      return null;

    return docOdmToModel(episodeOdm);
  }

  async getManyBySerieId(serieId: string): Promise<Model[]> {
    const episodesOdm = await ModelOdm.find( {
      serieId,
    } );

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToModel);
  }

  async updateOneByIdAndGet(fullId: ModelFullId, episode: UpdateOneParams): Promise<Model | null> {
    const modelOdm = modelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne(fullId, modelOdm);

    if (updateResult.matchedCount === 0)
      return null;

    const ret = docOdmToModel(modelOdm);

    return ret;
  }

  async createManyAndGet(models: Model[]): Promise<Model[]> {
    const docsOdm: DocOdm[] = models.map(modelToDocOdm);
    const inserted = await ModelOdm.insertMany(docsOdm);

    return inserted.map(docOdmToModel);
  }
}