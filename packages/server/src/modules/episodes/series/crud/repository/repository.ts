/* eslint-disable import/no-cycle */
import assert from "node:assert";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
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
import { EpisodeEntity } from "#episodes/models";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { GetManyProps } from "#episodes/crud/repositories/episodes/repository";
import { Series, SeriesEntity, SeriesKey } from "../../models";
import { getSeriesCriteriaPipeline } from "./odm/criteria-pipeline";
import { SeriesEvents } from "./events";
import { SeriesOdm } from "./odm";
import { FullDocOdm, ModelOdm } from "./odm/odm";
import { SeriesAvailableSlugGeneratorService } from "./available-slug-generator.service";

type Entity = SeriesEntity;
type Model = Series;

type Seasons = Record<string, EpisodeEntity[]>;

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
    @Inject(forwardRef(() => SeriesAvailableSlugGeneratorService))
    private readonly slugGenerator: SeriesAvailableSlugGeneratorService,
    private readonly episodesRepo: EpisodesRepository,
  ) { }

  @OnEvent(SeriesEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async getAll(): Promise<Entity[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(SeriesOdm.toEntity);
  }

  async getMany(criteria: GetManyCriteria): Promise<PaginatedResult<Entity[]>> {
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

  async getSeasonsById(
    id: string,
    episodeGetManyProps: GetManyProps,
  ): Promise<Seasons> {
    const serie = await ModelOdm.findById(id);

    assertFoundClient(serie);
    const episodes = await this.episodesRepo.getManyBySerieKey(serie.key, {
      requestingUserId: episodeGetManyProps.requestingUserId,
      criteria: {
        ...episodeGetManyProps.criteria,
        sort: {
          ...episodeGetManyProps.criteria.sort,
          episodeKey: "asc",
        },
      },
    } );
    const seasons: Seasons = {};

    for (const e of episodes) {
      const seasonNumberStr = getSeasonNumberByEpisodeKey(e.compKey.episodeKey).toString();
      const episodeEntity = e;
      let season = seasons[seasonNumberStr];

      if (!season) {
        season = [];
        seasons[seasonNumberStr] = season;
      }

      season.push(episodeEntity);
    }

    if (Object.entries(seasons).length === 1 && seasons["0"] !== undefined) {
      return {
        1: seasons["0"],
      };
    }

    return seasons;
  }

  @EmitEntityEvent(SeriesEvents.Created.TYPE)
  async createOneAndGet(dto: CreateDto): Promise<Entity> {
    const model = await this.createDtoToUpdateQuery(dto);
    const gotOdm = await ModelOdm.create(model);

    return SeriesOdm.toEntity(gotOdm);
  }

  private async createDtoToUpdateQuery(dto: CreateDto) {
    const uniqueKey = await this.slugGenerator.getAvailableKey(dto.key ?? dto.name);

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
      paramEntity.key = await this.slugGenerator.getAvailableKey(paramEntity.key);

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
    const serie = SeriesOdm.toEntity(gotOdm);

    if (result.lastErrorObject?.upserted)
      this.domainEventEmitter.emitEntity(SeriesEvents.Created.TYPE, serie);

    return serie;
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
