/* eslint-disable import/no-cycle */
import assert from "node:assert";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { EpisodesRestDtos } from "$shared/models/episodes/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEventEmitter } from "#modules/domain-event-emitter";
import { CanCreateManyAndGet, CanGetAll, CanGetManyByCriteria, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { DomainEvent } from "#modules/domain-event-emitter";
import { assertFound } from "#utils/validation/found";
import { SeriesKey } from "#modules/series";
import { MongoFilterQuery, MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { logDomainEvent } from "#main/logging/log-domain-event";
import { EmitEntityEvent } from "#modules/domain-event-emitter/emit-event";
import { EpisodeHistoryEntryEvents } from "../history/repositories/events";
import { LastTimePlayedService } from "../history/last-time-played.service";
import { Episode, EpisodeCompKey, EpisodeEntity } from "../models";
import { EpisodeEvents } from "./events";
import { getCriteriaPipeline } from "./odm/criteria-pipeline";
import { EpisodeOdm } from "./odm";

type CreateOneDto = Omit<Episode, "timestamps">;
type EpisodeId = EpisodeEntity["id"];

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
    private readonly domainEventEmitter: DomainEventEmitter,
    @Inject(forwardRef(() => LastTimePlayedService))
    private readonly lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @OnEvent(EpisodeEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(EpisodeHistoryEntryEvents.Created.TYPE)
  async handleCreateHistoryEntryEvents(event: EpisodeHistoryEntryEvents.Created.Event) {
    const { entity } = event.payload;

    await this.patchOneByCompKeyAndGet(entity.episodeCompKey, {
      entity: {
        lastTimePlayed: entity.date.timestamp,
      },
    } );
  }

  @OnEvent(EpisodeHistoryEntryEvents.Deleted.TYPE)
  async handleDeleteHistoryEntryEvents(event: EpisodeHistoryEntryEvents.Deleted.Event) {
    const { entity } = event.payload;

    await this.lastTimePlayedService
      .updateEpisodeLastTimePlayedByCompKey(entity.episodeCompKey);
    ;
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

    this.domainEventEmitter.emitPatch(EpisodeEvents.Patched.TYPE, {
      entity: episode,
      id: episodeId,
    } );

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
    const filter = {
      seriesKey,
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const episodesOdm = await EpisodeOdm.Model.find(filter);

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

  async patchOneByCompKeyAndGet(
    compKey: EpisodeCompKey,
    patchParams: PatchOneParams<Episode>,
  ): Promise<EpisodeEntity> {
    const episode = patchParams.entity;
    const partialDocOdm = EpisodeOdm.partialToDoc(episode);

    if (Object.keys(partialDocOdm).length === 0)
      throw new Error("Empty partialDocOdm, nothing to patch");

    const filter = {
      episodeKey: compKey.episodeKey,
      seriesKey: compKey.seriesKey,
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const updateResult = await EpisodeOdm.Model.findOneAndUpdate(filter, partialDocOdm);

    assertFound(updateResult);

    const episodeId = updateResult._id.toString();

    this.domainEventEmitter.emitPatch(EpisodeEvents.Patched.TYPE, {
      entity: episode,
      id: episodeId,
    } );

    const ret = await this.getOneByCompKey(compKey);

    assertFound(ret);

    return ret;
  }

  async getOneOrCreate(createDto: CreateOneDto): Promise<EpisodeEntity> {
    const model = this.createDtoToModel(createDto);
    const filter = {
      seriesKey: model.compKey.seriesKey,
      episodeKey: model.compKey.episodeKey,
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const update = {
      $setOnInsert: EpisodeOdm.toDoc(model), // Solo se aplica en la creación
    } satisfies MongoUpdateQuery<EpisodeOdm.Doc>;
    const result = await EpisodeOdm.Model.findOneAndUpdate(
      filter,
      update,
      {
        upsert: true, // crea si no existe
        new: true, // retorna el documento actualizado
        setDefaultsOnInsert: true, // aplica defaults solo en inserción
        includeResultMetadata: true, // para separar value y upserted
      },
    );

    assert(result.value !== null);
    const ret = EpisodeOdm.toEntity(result.value);

    if (result.lastErrorObject?.upserted)
      this.domainEventEmitter.emitEntity(EpisodeEvents.Created.TYPE, ret);

    return ret;
  }

  private createDtoToModel(createDto: CreateOneDto): Episode {
    const now = new Date();
    const model = {
      ...createDto,
      timestamps: {
        createdAt: now,
        updatedAt: now,
        addedAt: now,
      },
    };

    return model;
  }

  @EmitEntityEvent(EpisodeEvents.Created.TYPE)
  async createOneAndGet(createDto: CreateOneDto): Promise<EpisodeEntity> {
    const model = this.createDtoToModel(createDto);
    const doc: EpisodeOdm.Doc = EpisodeOdm.toDoc(model);
    const created = await EpisodeOdm.Model.create(doc);

    return EpisodeOdm.toEntity(created);
  }

  @EmitEntityEvent(EpisodeEvents.Created.TYPE)
  async createManyAndGet(models: Episode[]): Promise<EpisodeEntity[]> {
    const docsOdm: EpisodeOdm.Doc[] = models.map(EpisodeOdm.toDoc);
    const inserted = await EpisodeOdm.Model.insertMany(docsOdm);
    const ret = inserted.map(EpisodeOdm.toEntity);

    return ret;
  }
}
