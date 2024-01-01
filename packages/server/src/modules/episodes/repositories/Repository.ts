import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { SerieId } from "#modules/series";
import { HistoryList } from "#shared/models/historyLists";
import { deepMerge } from "#shared/utils/objects";
import { EventType, ModelEvent, PatchEvent } from "#utils/event-sourcing";
import { CanCreateManyAndGet, CanGetAll, CanGetOneById, CanPatchOneByIdAndGet, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { Event } from "#utils/message-broker";
import { EpisodeFileInfoRepository } from "..";
import { Model, ModelId } from "../models";
import { docOdmToModel, modelToDocOdm, partialModelToDocOdm } from "./adapters";
import { QUEUE_NAME } from "./events";
import { GetOptions, validateGetOptions } from "./get-options";
import ExpandEnum from "./get-options/ExpandEnum";
import { DocOdm, ModelOdm } from "./odm";

type UpdateOneParams = Model;
type Dependencies = {
  domainMessageBroker: DomainMessageBroker;
};

export type GetManyOptions = {
  sortById?: boolean;
};

export default class Repository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneByIdAndGet<Model, ModelId>,
CanPatchOneByIdAndGet<Model, ModelId>,
CanCreateManyAndGet<Model>,
CanGetAll<Model>
{
  #fileInfoRepository: EpisodeFileInfoRepository;

  #domainMessageBroker: DomainMessageBroker;

  constructor( {domainMessageBroker}: Dependencies) {
    this.#fileInfoRepository = new EpisodeFileInfoRepository();
    this.#domainMessageBroker = domainMessageBroker;

    this.#domainMessageBroker.subscribe(QUEUE_NAME, (event: Event<any>) => {
      logDomainEvent(event);

      return Promise.resolve();
    } );
  }

  async patchOneByPathAndGet(path: string, episode: Partial<UpdateOneParams>): Promise<Model | null> {
    const partialDocOdm = partialModelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne( {
      path,
    }, partialDocOdm);

    if (updateResult.matchedCount === 0 || updateResult.acknowledged === false)
      return null;

    const newPath = episode.path ?? path;
    const ret = await this.getOneByPath(newPath);

    if (ret) {
      const event = new PatchEvent<Model, ModelId>( {
        entityId: ret.id,
        key: "path",
        value: newPath,
      } );

      this.#domainMessageBroker.publish(QUEUE_NAME, event);
    }

    return ret;
  }

  async getAll(): Promise<Model[]> {
    const episodesOdm = await ModelOdm.find();

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToModel);
  }

  async getAllBySerieId(serieId: SerieId): Promise<Model[]> {
    const episodesOdm = await ModelOdm.find( {
      serieId,
    } );

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToModel);
  }

  async findLastEpisodeInHistoryList(historyList: HistoryList): Promise<Model | null> {
    const historyEntry = historyList.entries.at(-1);

    if (!historyEntry)
      return null;

    const {episodeId: fullId} = historyEntry;

    if (!fullId.innerId || !fullId.serieId)
      return null;

    return this.getOneById(fullId);
  }

  async getOneById(id: ModelId, opts?: GetOptions): Promise<Model | null> {
    validateGetOptions(opts);
    const episodeOdm = await ModelOdm.findOne( {
      serieId: id.serieId,
      episodeId: id.innerId,
    } );

    if (!episodeOdm)
      return null;

    const ret = docOdmToModel(episodeOdm);

    if (opts?.expand?.includes(ExpandEnum.FileInfo)) {
      const _id = episodeOdm._id?.toString();
      const fileInfo = await this.#fileInfoRepository.getAllBySuperId(_id);

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

  async getManyBySerieId(serieId: string, options?: GetManyOptions): Promise<Model[]> {
    const actualOptions = deepMerge( {
      sortById: true,
    }, options);
    let episodesOdm: DocOdm[];

    if (actualOptions.sortById) {
      episodesOdm = await ModelOdm.find( {
        serieId,
      } )
        .sort( {
          episodeId: 1,
        } )
        .collation( {
          locale: "en_US",
          numericOrdering: true,
        } )
        .exec();
    } else {
      episodesOdm = await ModelOdm.find( {
        serieId,
      } );
    }

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToModel);
  }

  async updateOneByIdAndGet(fullId: ModelId, episode: UpdateOneParams): Promise<Model | null> {
    const docOdm: DocOdm = modelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne( {
      episodeId:fullId.innerId,
      serieId: fullId.serieId,
    }, docOdm);

    if (updateResult.matchedCount === 0)
      return null;

    const event = new ModelEvent(EventType.UPDATED, {
      entity: episode,
    } );

    this.#domainMessageBroker.publish(QUEUE_NAME, event);

    return this.getOneById(fullId);
  }

  async patchOneByIdAndGet(fullId: ModelId, episode: Partial<UpdateOneParams>): Promise<Model | null> {
    const partialDocOdm = partialModelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne( {
      episodeId:fullId.innerId,
      serieId: fullId.serieId,
    }, partialDocOdm);

    if (updateResult.matchedCount === 0 || updateResult.acknowledged === false)
      return null;

    for (const [key, value] of Object.entries(episode)) {
      const event = new PatchEvent<Model, ModelId>( {
        entityId: fullId,
        key: key as keyof Model,
        value,
      } );

      this.#domainMessageBroker.publish(QUEUE_NAME, event);
    }

    return this.getOneById(fullId);
  }

  async createManyAndGet(models: Model[]): Promise<Model[]> {
    const docsOdm: DocOdm[] = models.map(modelToDocOdm);
    const inserted = await ModelOdm.insertMany(docsOdm);
    const ret = inserted.map(docOdmToModel);

    for (const model of ret) {
      const event = new ModelEvent(EventType.CREATED, {
        entity: model,
      } );

      this.#domainMessageBroker.publish(QUEUE_NAME, event);
    }

    return ret;
  }
}