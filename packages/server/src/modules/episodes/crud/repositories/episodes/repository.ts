import assert from "node:assert";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { Types } from "mongoose";
import { CanCreateManyAndGet, CanGetAll, CanGetManyByCriteria, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { assertFoundClient } from "#utils/validation/found";
import { SeriesKey } from "#modules/series";
import { MongoFilterQuery, MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent } from "#core/domain-event-emitter";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { fixTxtFields } from "#modules/resources/fix-text";
import { Episode, EpisodeCompKey, EpisodeEntity } from "../../../models";
import { LastTimePlayedService } from "../../../history/last-time-played.service";
import { EpisodeHistoryEntryEvents } from "../../../history/crud/repository/events";
import { EpisodeOdm } from "./odm";
import { getCriteriaPipeline } from "./odm/criteria-pipeline";
import { EpisodeEvents } from "./events";

function fixFields<T extends Partial<{title: string}>>(model: T): T {
  return fixTxtFields(model, ["title"]);
}

type CreateOneDto = Omit<Episode, "addedAt" | "createdAt" | "updatedAt">;
type EpisodeId = EpisodeEntity["id"];

type Criteria = EpisodesCrudDtos.GetManyByCriteria.Criteria;
type CriteriaOne = EpisodesCrudDtos.GetOne.Criteria;

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

  @OnEvent(EpisodeHistoryEntryEvents.Deleted.TYPE)
  async handleDeleteHistoryEntryEvents(event: EpisodeHistoryEntryEvents.Deleted.Event) {
    const { entity } = event.payload;

    await this.lastTimePlayedService
      .updateEpisodeLastTimePlayedById(entity.userId, entity.resourceId);
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
    const episode = fixFields(patchParams.entity);
    const partialDocOdm = EpisodeOdm.partialToDoc(episode);

    if (Object.keys(partialDocOdm).length === 0)
      throw new Error("Empty partialDocOdm, nothing to patch");

    const updateResult = await EpisodeOdm.Model.updateOne( {
      _id: id,
    }, partialDocOdm);

    if (updateResult.matchedCount === 0 || updateResult.acknowledged === false)
      assertFoundClient(null);

    const episodeId = updateResult.upsertedId!.toString();

    this.domainEventEmitter.emitPatch(EpisodeEvents.Patched.TYPE, {
      entity: episode,
      id: episodeId,
    } );

    const ret = await this.getOneById(id);

    assertFoundClient(ret);

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
    const episode = fixFields(patchParams.entity);
    const partialDocOdm = EpisodeOdm.partialToDoc(episode);

    if (Object.keys(partialDocOdm).length === 0)
      throw new Error("Empty partialDocOdm, nothing to patch");

    const filter = {
      episodeKey: compKey.episodeKey,
      seriesKey: compKey.seriesKey,
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const updateResult = await EpisodeOdm.Model.findOneAndUpdate(filter, partialDocOdm);

    assertFoundClient(updateResult);

    const episodeId = updateResult._id.toString();

    this.domainEventEmitter.emitPatch(EpisodeEvents.Patched.TYPE, {
      entity: episode,
      id: episodeId,
    } );

    const ret = await this.getOneByCompKey(compKey);

    assertFoundClient(ret);

    return ret;
  }

  async getOneOrCreate(createDto: CreateOneDto): Promise<EpisodeEntity> {
    const model = fixFields(this.createDtoToCreateDoc(createDto));
    const filter = {
      seriesKey: model.seriesKey,
      episodeKey: model.episodeKey,
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const update = {
      $setOnInsert: model, // Solo se aplica en la creación
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

  private createDtoToCreateDoc(
    createDto: CreateOneDto,
  ): Omit<EpisodeOdm.Doc, "createdAt" | "updatedAt"> {
    const createDoc = {
      episodeKey: createDto.compKey.episodeKey,
      seriesKey: createDto.compKey.seriesKey,
      title: createDto.title,
      uploaderUserId: new Types.ObjectId(createDto.uploaderUserId),
      tags: createDto.tags,
      disabled: createDto.disabled,
      releasedOn: createDto.releasedOn,
      addedAt: new Date(),
    };

    return createDoc;
  }

  @EmitEntityEvent(EpisodeEvents.Created.TYPE)
  async createOneAndGet(createDto: CreateOneDto): Promise<EpisodeEntity> {
    const createDoc = fixFields(this.createDtoToCreateDoc(createDto));
    const created = await EpisodeOdm.Model.create(createDoc);

    return EpisodeOdm.toEntity(created);
  }

  @EmitEntityEvent(EpisodeEvents.Created.TYPE)
  async createManyAndGet(models: Episode[]): Promise<EpisodeEntity[]> {
    const docsOdm: EpisodeOdm.Doc[] = models.map(m=> {
      return EpisodeOdm.toDoc(fixFields(m));
    } );
    const inserted = await EpisodeOdm.Model.insertMany(docsOdm);
    const ret = inserted.map(EpisodeOdm.toEntity);

    return ret;
  }
}
