import assert from "node:assert";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { SeriesCrudDtos } from "$shared/models/episodes/series/dto/transport";
import { PaginatedResult } from "$shared/utils/http/responses";
import { assertFoundClient } from "#utils/validation/found";
import { CanCreateOneAndGet, CanDeleteOneByIdAndGet, CanGetAll, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { MongoFilterQuery, MongoUpdateQuery, patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { DomainEvent } from "#core/domain-event-emitter";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { getUniqueString } from "#modules/resources/get-unique-string";
import { Series, SeriesEntity, SeriesKey } from "../../models";
import { FullDocOdm, ModelOdm } from "./odm/odm";
import { SeriesOdm } from "./odm";
import { SeriesEvents } from "./events";
import { getSeriesCriteriaPipeline } from "./odm/criteria-pipeline";

type Entity = SeriesEntity;
type Model = Series;

export type GetManyCriteria = SeriesCrudDtos.GetMany.Criteria & { requestUserId: string |
  null; };

export type CreateDto = SeriesCrudDtos.CreateOne.Body;

@Injectable()
export class SeriesRepository
implements
CanCreateOneAndGet<Entity>,
CanGetAll<Entity>,
CanGetOneById<Entity, string>,
CanPatchOneByIdAndGet<Entity, string, Model>,
CanDeleteOneByIdAndGet<Entity, string> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(SeriesEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async getAll(): Promise<Entity[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(SeriesOdm.toEntity);
  }

  async getAvailableKey(baseKey: string): Promise<string> {
    return await getUniqueString(
      baseKey,
      async (candidate) => {
        const series = await this.getOneByKey(candidate);

        return !series;
      },
    );
  }

  async getMany(criteria: GetManyCriteria): Promise<PaginatedResult<Entity>> {
    const pipeline = getSeriesCriteriaPipeline(criteria);
    const [result] = await ModelOdm.aggregate(pipeline);
    const seriesDocs = result?.data || [];
    const data = seriesDocs.map(SeriesOdm.toEntity);
    const totalCount = result?.metadata?.[0]?.totalCount ?? 0;

    return {
      data,
      metadata: {
        totalCount,
      },
    };
  }

  async getOneById(id: string): Promise<Entity | null> {
    const doc = await ModelOdm.findById(id);

    if (!doc)
      return null;

    return SeriesOdm.toEntity(doc);
  }

  @EmitEntityEvent(SeriesEvents.Created.TYPE)
  async createOneAndGet(dto: CreateDto): Promise<Entity> {
    const model = await this.createDtoToUpdateQuery(dto);
    const gotOdm = await ModelOdm.create(model);

    return SeriesOdm.toEntity(gotOdm);
  }

  private async createDtoToUpdateQuery(dto: CreateDto) {
    const uniqueKey = await this.getAvailableKey(dto.key ?? dto.name);

    return SeriesOdm.partialToDoc( {
      ...dto,
      key: uniqueKey,
      imageCoverId: dto.imageCoverId ?? null,
      addedAt: new Date(),
    } );
  }

  async patchOneByIdAndGet(id: string, params: PatchOneParams<Model>): Promise<Entity> {
    const { entity: paramEntity } = params;

    // Si se está actualizando la key, asegurarse de que es única
    if (paramEntity.key)
      paramEntity.key = await this.getAvailableKey(paramEntity.key);

    const updateQuery = patchParamsToUpdateQuery( {
      ...params,
      entity: paramEntity,
    }, SeriesOdm.partialToDoc);
    const doc = await ModelOdm.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    );

    assertFoundClient(doc);

    const ret = SeriesOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(SeriesEvents.Patched.TYPE, {
      partialEntity: paramEntity,
      id,
      unset: params.unset,
    } );

    return ret;
  }

  @EmitEntityEvent(SeriesEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<Entity> {
    const doc = await ModelOdm.findByIdAndDelete(id);

    assertFoundClient(doc);

    // TODO: eliminar todos los episodes
    return SeriesOdm.toEntity(doc);
  }

  async getOneByKey(key: SeriesKey): Promise<Entity | null> {
    const [serieDb]: FullDocOdm[] = await ModelOdm.find( {
      key,
    } );

    if (!serieDb)
      return null;

    return SeriesOdm.toEntity(serieDb);
  }

  async getOneOrCreate(dto: CreateDto): Promise<Entity> {
    const model = await this.createDtoToUpdateQuery(dto);
    const filter: MongoFilterQuery<FullDocOdm> = {
      key: model.key,
    };
    const update: MongoUpdateQuery<FullDocOdm> = {
      $setOnInsert: model, // Solo se aplica en la creación
    };
    const result = await SeriesOdm.Model.findOneAndUpdate(
      filter,
      update,
      {
        upsert: true, // crea si no existe
        new: true, // retorna el documento actualizado
        setDefaultsOnInsert: true, // aplica defaults solo en inserción
        includeResultMetadata: true, // para separar value y upserted
      },
    );
    const gotOdm = result.value;

    assert(gotOdm !== null);
    const series = SeriesOdm.toEntity(gotOdm);

    if (result.lastErrorObject?.upserted)
      this.domainEventEmitter.emitEntity(SeriesEvents.Created.TYPE, series);

    return series;
  }
}

export function getSeasonNumberByEpisodeKey(episodeKey: string): number {
  const crossIndex = episodeKey.indexOf("x");

  if (crossIndex === -1)
    return 0;

  const firstPart = episodeKey.substring(0, crossIndex);
  const parsedNumber = parseInt(firstPart, 10);

  if (isNaN(parsedNumber))
    return 0;

  return parsedNumber;
}
