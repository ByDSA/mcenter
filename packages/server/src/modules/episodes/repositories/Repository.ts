import { showError } from "#shared/utils/errors/showError";
import { deepMerge } from "#shared/utils/objects";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { FileInfoRepository as EpisodeFileInfoRepository } from "#modules/file-info";
import { logDomainEvent } from "#modules/log";
import { SerieId } from "#series/models";
import { EventType, ModelEvent, PatchEvent } from "#utils/event-sourcing";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateManyAndGet, CanGetAll, CanGetOneById, CanPatchOneByIdAndGet, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { Event } from "#utils/message-broker";
import { Episode, EpisodeId } from "../models";
import { DocOdm, ModelOdm } from "./odm";
import { ExpandEnum, GetOptions, validateGetOptions } from "./get-options";
import { EPISODE_QUEUE_NAME } from "./events";
import { docOdmToModel, modelToDocOdm, partialModelToDocOdm } from "./adapters";

type UpdateOneParams = Episode;

export type GetManyOptions = {
  sortById?: boolean;
};

const DEPS_MAP = {
  domainMessageBroker: DomainMessageBroker,
  episodeFileInfoRepository: EpisodeFileInfoRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class EpisodeRepository
implements CanGetOneById<Episode, EpisodeId>,
CanUpdateOneByIdAndGet<Episode, EpisodeId>,
CanPatchOneByIdAndGet<Episode, EpisodeId>,
CanCreateManyAndGet<Episode>,
CanGetAll<Episode> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, (event: Event<any>) => {
      logDomainEvent(EPISODE_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  async patchOneByPathAndGet(
    path: string,
    episode: Partial<UpdateOneParams>,
  ): Promise<Episode | null> {
    const partialDocOdm = partialModelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne( {
      path,
    }, partialDocOdm);

    if (updateResult.matchedCount === 0 || updateResult.acknowledged === false)
      return null;

    const newPath = episode.path ?? path;
    const ret = await this.getOneByPath(newPath);

    if (ret) {
      const event = new PatchEvent<Episode, EpisodeId>( {
        entityId: ret.id,
        key: "path",
        value: newPath,
      } );

      await this.#deps.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    return ret;
  }

  async getAll(): Promise<Episode[]> {
    const episodesOdm = await ModelOdm.find();

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToModel);
  }

  async getAllBySerieId(serieId: SerieId): Promise<Episode[]> {
    const episodesOdm = await ModelOdm.find( {
      serieId,
    } );

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToModel);
  }

  async getOneById(id: EpisodeId, opts?: GetOptions): Promise<Episode | null> {
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
      const fileInfo = await this.#deps.episodeFileInfoRepository.getAllBySuperId(_id);

      if (!fileInfo)
        throw new Error("Episode has no file info");

      ret.fileInfo = fileInfo.at(0);
    }

    return ret;
  }

  async getOneByPath(path: string): Promise<Episode | null> {
    const episodeOdm = await ModelOdm.findOne( {
      path,
    } );

    if (!episodeOdm)
      return null;

    return docOdmToModel(episodeOdm);
  }

  async getManyBySerieId(serieId: string, options?: GetManyOptions): Promise<Episode[]> {
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

  async updateOneByIdAndGet(fullId: EpisodeId, episode: UpdateOneParams): Promise<Episode | null> {
    const docOdm: DocOdm = modelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne( {
      episodeId: fullId.innerId,
      serieId: fullId.serieId,
    }, docOdm);

    if (updateResult.matchedCount === 0)
      return null;

    const event = new ModelEvent(EventType.UPDATED, {
      entity: episode,
    } );

    await this.#deps.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);

    return this.getOneById(fullId);
  }

  async patchOneByIdAndGet(
    fullId: EpisodeId,
    episode: Partial<UpdateOneParams>,
  ): Promise<Episode | null> {
    const partialDocOdm = partialModelToDocOdm(episode);
    const updateResult = await ModelOdm.updateOne( {
      episodeId: fullId.innerId,
      serieId: fullId.serieId,
    }, partialDocOdm);

    if (updateResult.matchedCount === 0 || updateResult.acknowledged === false)
      return null;

    for (const [key, value] of Object.entries(episode)) {
      const event = new PatchEvent<Episode, EpisodeId>( {
        entityId: fullId,
        key: key as keyof Episode,
        value,
      } );

      await this.#deps.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    return this.getOneById(fullId);
  }

  async createManyAndGet(models: Episode[]): Promise<Episode[]> {
    const docsOdm: DocOdm[] = models.map(modelToDocOdm);
    const inserted = await ModelOdm.insertMany(docsOdm);
    const ret = inserted.map(docOdmToModel);

    for (const model of ret) {
      const event = new ModelEvent(EventType.CREATED, {
        entity: model,
      } );

      await this.#deps.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    return ret;
  }
}
