import { Injectable } from "@nestjs/common";
import { deepMerge } from "$shared/utils/objects";
import { showError } from "$shared/utils/errors/showError";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeFileInfoRepository } from "#modules/file-info";
import { logDomainEvent } from "#modules/log";
import { SerieId } from "#series/models";
import { EventType, ModelEvent, ModelMessage, PatchEvent } from "#utils/event-sourcing";
import { CanCreateManyAndGet, CanGetAll, CanGetOneById, CanPatchOneByIdAndGet, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { BrokerEvent } from "#utils/message-broker";
import { Episode, EpisodeEntity, EpisodeId } from "../models";
import { DocOdm, ModelOdm } from "./odm";
import { ExpandEnum, GetOptions, validateGetOptions } from "./get-options";
import { EPISODE_QUEUE_NAME } from "./events";
import { docOdmToEntity, entityToDocOdm, modelToDocOdm, partialModelToDocOdm } from "./adapters";

type UpdateOneParams = Episode;

export type EpisodeEvent = BrokerEvent<ModelMessage<EpisodeEntity>>;

export type GetManyOptions = {
  sortById?: boolean;
};

@Injectable()
export class EpisodesRepository
implements CanGetOneById<EpisodeEntity, EpisodeId>,
CanUpdateOneByIdAndGet<EpisodeEntity, EpisodeId>,
CanPatchOneByIdAndGet<EpisodeEntity, EpisodeId>,
CanCreateManyAndGet<EpisodeEntity>,
CanGetAll<EpisodeEntity> {
  constructor(
    private domainMessageBroker: DomainMessageBroker,
    private episodeFileInfoRepository: EpisodeFileInfoRepository,
  ) {
    this.domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, (event: EpisodeEvent) => {
      logDomainEvent(EPISODE_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  static providers = Object.freeze([
    DomainMessageBroker,
    EpisodeFileInfoRepository,
    ...EpisodeFileInfoRepository.providers,
  ]);

  async patchOneByPathAndGet(
    path: string,
    episode: Partial<UpdateOneParams>,
  ): Promise<EpisodeEntity | null> {
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

      await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    return ret;
  }

  async getAll(): Promise<EpisodeEntity[]> {
    const episodesOdm: DocOdm[] = await ModelOdm.find();

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToEntity) as EpisodeEntity[];
  }

  async getAllBySerieId(serieId: SerieId): Promise<EpisodeEntity[]> {
    const episodesOdm = await ModelOdm.find( {
      serieId,
    } );

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(docOdmToEntity) as EpisodeEntity[];
  }

  async getOneById(id: EpisodeId, opts?: GetOptions): Promise<EpisodeEntity | null> {
    validateGetOptions(opts);
    const episodeOdm = await ModelOdm.findOne( {
      serieId: id.serieId,
      episodeId: id.innerId,
    } );

    if (!episodeOdm)
      return null;

    const ret = docOdmToEntity(episodeOdm) as EpisodeEntity;

    if (opts?.expand?.includes(ExpandEnum.FileInfo)) {
      const _id = episodeOdm._id?.toString();
      const fileInfo = await this.episodeFileInfoRepository.getAllByEpisodeDbId(_id);

      if (!fileInfo)
        throw new Error("Episode has no file info");

      ret.fileInfo = fileInfo.at(0);
    }

    return ret;
  }

  async getOneByPath(path: string): Promise<EpisodeEntity | null> {
    const episodeOdm = await ModelOdm.findOne( {
      path,
    } );

    if (!episodeOdm)
      return null;

    return docOdmToEntity(episodeOdm) as EpisodeEntity;
  }

  async getManyBySerieId(serieId: string, options?: GetManyOptions): Promise<EpisodeEntity[]> {
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

    return episodesOdm.map(docOdmToEntity) as EpisodeEntity[];
  }

  async updateOneByIdAndGet(
    fullId: EpisodeId,
    episode: UpdateOneParams,
  ): Promise<EpisodeEntity | null> {
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

    await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);

    return this.getOneById(fullId);
  }

  async patchOneByIdAndGet(
    fullId: EpisodeId,
    patchParams: PatchOneParams<Episode>,
  ): Promise<EpisodeEntity | null> {
    const episode = patchParams.entity;
    const partialDocOdm = partialModelToDocOdm(episode);

    if (Object.keys(partialDocOdm).length === 0)
      throw new Error("Empty partialDocOdm, nothing to patch");

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

      await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    return this.getOneById(fullId);
  }

  async createManyAndGet(models: EpisodeEntity[]): Promise<EpisodeEntity[]> {
    const docsOdm: DocOdm[] = models.map(entityToDocOdm);
    const inserted = await ModelOdm.insertMany(docsOdm);
    const ret = inserted.map(docOdmToEntity);

    for (const model of ret) {
      const event = new ModelEvent(EventType.CREATED, {
        entity: model,
      } );

      await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    return ret as EpisodeEntity[];
  }
}
