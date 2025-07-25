/* eslint-disable import/no-cycle */
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { EpisodesRestDtos } from "$shared/models/episodes/dto/transport";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { EventType, ModelEvent, ModelMessage, PatchEvent } from "#utils/event-sourcing";
import { CanCreateManyAndGet, CanGetAll, CanGetManyByCriteria, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { BrokerEvent } from "#utils/message-broker";
import { EpisodeFileInfoRepository } from "#episodes/file-info";
import { assertFound } from "#utils/validation/found";
import { SeriesKey } from "#modules/series";
import { EPISODE_HISTORY_ENTRIES_QUEUE_NAME } from "../history/repositories/events";
import { EpisodeHistoryEntryEvent } from "../history/repositories";
import { LastTimePlayedService } from "../history/last-time-played.service";
import { Episode, EpisodeCompKey, EpisodeEntity } from "../models";
import { getCriteriaPipeline } from "./odm/criteria-pipeline";
import { EpisodeOdm } from "./odm";
import { EPISODE_QUEUE_NAME } from "./events";

type UpdateOneParams = Episode;
type EpisodeId = EpisodeEntity["id"];

export type EpisodeEvent = BrokerEvent<ModelMessage<EpisodeEntity>>;

type Criteria = EpisodesRestDtos.GetManyByCriteria.Criteria;
type CriteriaOne = EpisodesRestDtos.GetOne.Criteria;

@Injectable()
export class EpisodesRepository
implements
CanCreateManyAndGet<EpisodeEntity>,
CanGetOneById<EpisodeEntity, EpisodeId>,
CanPatchOneByIdAndGet<Episode, EpisodeId>,
CanGetManyByCriteria<EpisodeEntity, Criteria>,
CanGetAll<EpisodeEntity> {
  constructor(
    private readonly domainMessageBroker: DomainMessageBroker,
    private readonly episodeFileInfoRepository: EpisodeFileInfoRepository,
    @Inject(forwardRef(() => LastTimePlayedService))
    private readonly lastTimePlayedService: LastTimePlayedService,
  ) {
    this.domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, (event: EpisodeEvent) => {
      logDomainEvent(EPISODE_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
    this.domainMessageBroker.subscribe(
      EPISODE_HISTORY_ENTRIES_QUEUE_NAME,
      async (event: EpisodeHistoryEntryEvent) => {
        const { entity } = event.payload;

        if (event.type === EventType.CREATED) {
          await this.patchOneByCompKeyAndGet(entity.episodeCompKey, {
            entity: {
              lastTimePlayed: entity.date.timestamp,
            },
          } );
        } else if (event.type === EventType.DELETED) {
          await this.lastTimePlayedService
            .updateEpisodeLastTimePlayedByCompKey(entity.episodeCompKey);
        }

        return Promise.resolve();
      },
    ).catch(showError);
  }

  async getManyByCriteria(criteria: Criteria): Promise<EpisodeEntity[]> {
    const pipeline = getCriteriaPipeline(criteria);
    const episodesOdm = await EpisodeOdm.Model.aggregate(pipeline, {
      ...(criteria.sort?.episodeCompKey && {
        collation: {
          locale: "en_US",
          numericOrdering: true,
        },
      } ),
    } );

    return episodesOdm.map(EpisodeOdm.toEntity);
  }

  async patchOneByIdAndGet(
    id: EpisodeId,
    patchParams: PatchOneParams<Partial<Episode>>,
  ): Promise<EpisodeEntity> {
    const episode = patchParams.entity;
    const partialDocOdm = EpisodeOdm.partialToDoc(episode);

    if (Object.keys(partialDocOdm).length === 0)
      throw new Error("Empty partialDocOdm, nothing to patch");

    const updateResult = await EpisodeOdm.Model.updateOne( {
      _id: id,
    }, partialDocOdm);

    if (updateResult.matchedCount === 0 || updateResult.acknowledged === false)
      assertFound(null);

    const episodeId = updateResult.upsertedId!.toString();

    for (const [key, value] of Object.entries(episode)) {
      const event = new PatchEvent<Episode, EpisodeId>( {
        entityId: episodeId,
        key: key as keyof Episode,
        value,
      } );

      await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    const ret = await this.getOneById(id);

    assertFound(ret);

    return ret;
  }

  async getOneById(
    id: EpisodeId,
    criteria?: Pick<CriteriaOne, "expand">,
  ): Promise<EpisodeEntity | null> {
  // Si no hay criteria, usar findById (más eficiente)
    if (!criteria?.expand || Object.keys(criteria.expand).length === 0) {
      const episodeOdm = await EpisodeOdm.Model.findById(id);

      return episodeOdm ? EpisodeOdm.toEntity(episodeOdm) : null;
    }

    // Si hay expand, usar aggregate para poder aplicar las transformaciones
    const [episode] = await this.getManyByCriteria( {
      ...criteria,
      filter: {
        id,
      },
      limit: 1,
    } );

    return episode;
  }

  async getAll(): Promise<EpisodeEntity[]> {
    const episodesOdm: EpisodeOdm.FullDoc[] = await EpisodeOdm.Model.find();

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(EpisodeOdm.toEntity);
  }

  async getAllBySeriesKey(seriesKey: SeriesKey): Promise<EpisodeEntity[]> {
    const episodesOdm = await EpisodeOdm.Model.find( {
      serieId: seriesKey,
    } );

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(EpisodeOdm.toEntity);
  }

  async getOneByCriteria(criteria: CriteriaOne): Promise<EpisodeEntity | null> {
    const [episode] = await this.getManyByCriteria( {
      ...criteria,
      limit: 1,
    } );

    return episode;
  }

  async getOneByCompKey(
    compKey: EpisodeCompKey,
    criteria?: Omit<CriteriaOne, "filter">,
  ): Promise<EpisodeEntity | null> {
    return await this.getOneByCriteria( {
      ...criteria,
      filter: {
        episodeKey: compKey.episodeKey,
        seriesKey: compKey.seriesKey,
      },
    } );
  }

  async getManyBySerieKey(
    seriesKey: SeriesKey,
    criteria?: Omit<Criteria, "filter">,
  ): Promise<EpisodeEntity[]> {
    return await this.getManyByCriteria( {
      ...criteria,
      filter: {
        seriesKey,
      },
    } );
  }

  async updateOneByIdAndGet(
    episodeId: EpisodeId,
    episode: UpdateOneParams,
  ): Promise<EpisodeEntity | null> {
    const doc: EpisodeOdm.Doc = EpisodeOdm.toDoc(episode);
    const updateResult = await EpisodeOdm.Model.updateOne( {
      _id: episodeId,
    }, doc);

    if (updateResult.matchedCount === 0)
      return null;

    const event = new ModelEvent(EventType.UPDATED, {
      entity: episode,
    } );

    await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);

    return this.getOneById(episodeId);
  }

  async patchOneByCompKeyAndGet(
    compKey: EpisodeCompKey,
    patchParams: PatchOneParams<Episode>,
  ): Promise<EpisodeEntity> {
    const episode = patchParams.entity;
    const partialDocOdm = EpisodeOdm.partialToDoc(episode);

    if (Object.keys(partialDocOdm).length === 0)
      throw new Error("Empty partialDocOdm, nothing to patch");

    const updateResult = await EpisodeOdm.Model.findOneAndUpdate( {
      episodeId: compKey.episodeKey,
      serieId: compKey.seriesKey,
    }, partialDocOdm);

    assertFound(updateResult);

    const episodeId = updateResult._id.toString();

    for (const [key, value] of Object.entries(episode)) {
      const event = new PatchEvent<Episode, EpisodeId>( {
        entityId: episodeId,
        key: key as keyof Episode,
        value,
      } );

      await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    const ret = await this.getOneByCompKey(compKey);

    assertFound(ret);

    return ret;
  }

  async createOneAndGet(model: Episode): Promise<EpisodeEntity> {
    const doc: EpisodeOdm.Doc = EpisodeOdm.toDoc(model);
    const created = await EpisodeOdm.Model.create(doc);
    const ret = EpisodeOdm.toEntity(created);
    const event = new ModelEvent(EventType.CREATED, {
      entity: ret,
    } );

    await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);

    return ret;
  }

  async createManyAndGet(models: Episode[]): Promise<EpisodeEntity[]> {
    const docsOdm: EpisodeOdm.Doc[] = models.map(EpisodeOdm.toDoc);
    const inserted = await EpisodeOdm.Model.insertMany(docsOdm);
    const ret = inserted.map(EpisodeOdm.toEntity);

    for (const model of ret) {
      const event = new ModelEvent(EventType.CREATED, {
        entity: model,
      } );

      await this.domainMessageBroker.publish(EPISODE_QUEUE_NAME, event);
    }

    return ret;
  }
}
