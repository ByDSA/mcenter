import { SerieId } from "#modules/series";
import { HistoryList } from "#shared/models/historyLists";
import { CanCreateManyAndGet, CanGetOneById, CanPatchOneByIdAndGet, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { z } from "zod";
import { EpisodeFileInfoRepository } from "..";
import { Model, ModelFullId } from "../models";
import { docOdmToModel, modelToDocOdm, partialModelToDocOdm } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

type UpdateOneParams = Model;

enum ExpandEnum {
  FileInfo = "fileInfo",
}

export {
  ExpandEnum as EpisodeRepositoryExpandEnum,
};
const OptionsSchema = z.object( {
  expand: z.array(z.nativeEnum(ExpandEnum)).optional(),
} );

type Options = z.infer<typeof OptionsSchema>;

function validateOptions(opts?: Options) {
  if (opts)
    OptionsSchema.parse(opts);
}

export default class Repository
implements CanGetOneById<Model, ModelFullId>,
CanUpdateOneByIdAndGet<Model, ModelFullId>,
CanPatchOneByIdAndGet<Model, ModelFullId>,
CanCreateManyAndGet<Model>
{
  #fileInfoRepository: EpisodeFileInfoRepository;

  constructor() {
    this.#fileInfoRepository = new EpisodeFileInfoRepository();
  }

  async patchOneByPathAndGet(path: string, episode: Partial<UpdateOneParams>): Promise<Model | null> {
    const partialDocOdm: Partial<DocOdm> = partialModelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne( {
      path,
    }, partialDocOdm);

    if (updateResult.matchedCount === 0)
      return null;

    const newPath = episode.path ?? path;

    return this.getOneByPath(newPath);
  }

  async getAllBySerieId(id: SerieId): Promise<Model[]> {
    const episodesOdm = await ModelOdm.find( {
      serieId: id,
    } );

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToModel);
  }

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

  async getOneById(fullId: ModelFullId, opts?: Options): Promise<Model | null> {
    validateOptions(opts);
    const episodeOdm = await ModelOdm.findOne( {
      serieId: fullId.serieId,
      episodeId: fullId.episodeId,
    } );

    if (!episodeOdm)
      return null;

    const ret = docOdmToModel(episodeOdm);

    if (opts?.expand?.includes(ExpandEnum.FileInfo)) {
      const id = episodeOdm._id?.toString();
      const fileInfo = await this.#fileInfoRepository.getAllBySuperId(id);

      if (!fileInfo)
        throw new Error("Episode has no file info");

      ret.fileInfo = fileInfo.at(0);
    }

    return ret;
  }

  async getOneByPath(path: string): Promise<Model | null> {
    const episodeOdm = await ModelOdm.findOne( {
      path,
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
    const docOdm: DocOdm = modelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne(fullId, docOdm);

    if (updateResult.matchedCount === 0)
      return null;

    return this.getOneById(fullId);
  }

  async patchOneByIdAndGet(fullId: ModelFullId, episode: Partial<UpdateOneParams>): Promise<Model | null> {
    const partialDocOdm: Partial<DocOdm> = partialModelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne(fullId, partialDocOdm);

    if (updateResult.matchedCount === 0)
      return null;

    return this.getOneById(fullId);
  }

  async createManyAndGet(models: Model[]): Promise<Model[]> {
    const docsOdm: DocOdm[] = models.map(modelToDocOdm);
    const inserted = await ModelOdm.insertMany(docsOdm);

    return inserted.map(docOdmToModel);
  }
}