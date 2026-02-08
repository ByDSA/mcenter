import assert from "node:assert";
import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { OnEvent } from "@nestjs/event-emitter";
import { Types } from "mongoose";
import { PaginatedResult } from "$shared/utils/http/responses";
import { CanCreateManyAndGet, CanDeleteOneByIdAndGet, CanGetAll, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { assertFoundClient } from "#utils/validation/found";
import { SeriesKey } from "#episodes/series";
import { MongoFilterQuery, MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent } from "#core/domain-event-emitter";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { fixTxtFields } from "#modules/resources/fix-text";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { getSeasonNumberByEpisodeKey } from "#episodes/series/crud/repository/repository";
import { Episode, EpisodeEntity } from "../../../models";
import { EpisodeOdm } from "./odm";
import { getCriteriaPipeline } from "./odm/criteria-pipeline";
import { EpisodeEvents } from "./events";

function fixFields<T extends Partial<{title: string}>>(model: T): T {
  return fixTxtFields(model, ["title"]);
}

type CreateOneDto = EpisodesCrudDtos.CreateOne.Body;
type EpisodeId = EpisodeEntity["id"];

type Criteria = EpisodesCrudDtos.GetMany.Criteria;
type CriteriaOne = EpisodesCrudDtos.GetOne.Criteria;

type Options = {
  requestingUserId?: string;
};

type Seasons = Record<string, EpisodeEntity[]>;

@Injectable()
export class EpisodesRepository
implements
CanCreateManyAndGet<EpisodeEntity>,
CanGetOneById<EpisodeEntity, EpisodeId>,
CanPatchOneByIdAndGet<Episode, EpisodeId>,
CanDeleteOneByIdAndGet<EpisodeEntity, EpisodeId>,
CanGetAll<EpisodeEntity> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) {
  }

  @OnEvent(EpisodeEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async getSeasonsById(
    seriesId: string,
    criteria?: Criteria,
    options?: Options,
  ): Promise<Seasons> {
    const { data: episodes } = await this.getMany(
      {
        ...criteria,
        filter: {
          ...criteria?.filter,
          seriesId,
        },
        sort: {
          ...criteria?.sort,
          episodeKey: "asc",
        },
      },
      {
        requestingUserId: options?.requestingUserId,
      },
    );
    const seasons: Seasons = {};

    for (const e of episodes) {
      const seasonNumberStr = getSeasonNumberByEpisodeKey(e.episodeKey).toString();
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

  async getMany(
    criteria: Criteria,
    options?: Options,
  ): Promise<PaginatedResult<EpisodeEntity>> {
    const requestingUserId = options?.requestingUserId;
    const pipeline = getCriteriaPipeline(requestingUserId, criteria);
    const res = await EpisodeOdm.Model.aggregate(pipeline, {
      ...(criteria.sort?.episodeCompKey && {
        collation: {
          locale: "en_US",
          numericOrdering: true,
        },
      } ),
    } );
    const data = res[0].data.map(EpisodeOdm.toEntity);

    return {
      data,
    };
  }

  /**
   *
   * @deprecated
   */
  async getOneBySeriesKeyAndEpisodeKey(
    seriesKey: string,
    episodeKey: string,
    criteria?: CriteriaOne,
    options?: Options,
  ): Promise<EpisodeEntity | null> {
    try {
      const seriesId = await this.getSeriesIdStr(seriesKey);

      return this.getOne( {
        ...criteria,
        filter: {
          ...criteria?.filter,
          seriesId,
          episodeKey,
        },

      }, options);
    } catch {
      return null;
    }
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
      _id: new Types.ObjectId(id),
    }, partialDocOdm);

    if (updateResult.matchedCount === 0 || updateResult.acknowledged === false)
      assertFoundClient(null);

    const episodeId = updateResult.upsertedId?.toString() ?? id;

    this.domainEventEmitter.emitPatch(EpisodeEvents.Patched.TYPE, {
      partialEntity: episode,
      id: episodeId,
    } );

    const ret = await this.getOneById(id);

    assertFoundClient(ret);

    return ret;
  }

  @EmitEntityEvent(EpisodeEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: EpisodeId): Promise<EpisodeEntity> {
    const doc = await EpisodeOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    return EpisodeOdm.toEntity(doc);
  }

  async getOneById(
    id: EpisodeId,
    criteria?: Pick<Criteria, "expand">,
    options?: Options,
  ): Promise<EpisodeEntity | null> {
    // Si no hay criteria, usar findById (más eficiente)
    if (!criteria?.expand || Object.keys(criteria.expand).length === 0) {
      const episodeOdm = await EpisodeOdm.Model.findById(id);

      return episodeOdm ? EpisodeOdm.toEntity(episodeOdm) : null;
    }

    const episode = await this.getOne(
      {
        ...criteria,
        filter: {
          id,
        },
      },
      options,
    );

    return episode;
  }

  async getAll(): Promise<EpisodeEntity[]> {
    const episodesOdm: EpisodeOdm.FullDoc[] = await EpisodeOdm.Model.find();

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(EpisodeOdm.toEntity);
  }

  /**
   * @deprecated
   */
  private async getSeriesIdStr(seriesKey: string) {
    const seriesDoc = await SeriesOdm.Model.findOne( {
      key: seriesKey,
    } );

    assertFoundClient(seriesDoc);

    return seriesDoc._id.toString();
  }

  /**
   *
   * @deprecated
   */
  async getAllBySeriesKey(seriesKey: SeriesKey): Promise<EpisodeEntity[]> {
    const seriesId = await this.getSeriesIdStr(seriesKey);
    const filter = {
      seriesId: new Types.ObjectId(seriesId),
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const episodesOdm = await EpisodeOdm.Model.find(filter);

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(EpisodeOdm.toEntity);
  }

  async getAllBySeriesId(seriesId: string): Promise<EpisodeEntity[]> {
    const filter = {
      seriesId: new Types.ObjectId(seriesId),
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const episodesOdm = await EpisodeOdm.Model.find(filter);

    if (episodesOdm.length === 0)
      return [];

    return episodesOdm.map(EpisodeOdm.toEntity);
  }

  async getOne(criteria: CriteriaOne, options?: Options): Promise<EpisodeEntity | null> {
    const { data } = await this.getMany(
      {
        ...criteria,
        limit: 1,
      },
      {
        requestingUserId: options?.requestingUserId,
      },
    );

    return data[0] ?? null;
  }

  /**
   *
   * @deprecated
   */
  async getOneByEpisodeKeyAndSerieId(
    episodeKey: string,
    seriesId: string,
    criteria: CriteriaOne,
    options?: Options,
  ): Promise<EpisodeEntity | null> {
    return await this.getOne( {
      ...criteria,
      filter: {
        ...criteria.filter,
        episodeKey,
        seriesId,
      },
    }, options);
  }

  /**
   *
   * @deprecated
   */
  async getManyBySerieKey(
    seriesKey: SeriesKey,
    criteria?: Omit<Criteria, "filter">,
    options?: Options,
  ): Promise<EpisodeEntity[]> {
    const seriesDoc = await SeriesOdm.Model.findOne( {
      key: seriesKey,
    } );

    if (!seriesDoc)
      return [];

    const seriesId = seriesDoc._id.toString();
    const { data } = await this.getMany(
      {
        ...criteria,
        filter: {
          seriesId,
        },
      },
      {
        requestingUserId: options?.requestingUserId,
      },
    );

    return data;
  }

  /**
   *
   * @deprecated
   */
  async patchOneByCompKeyAndGet(
    compKey: EpisodeCompKey,
    patchParams: PatchOneParams<Episode>,
  ): Promise<EpisodeEntity> {
    const episode = fixFields(patchParams.entity);
    const partialDocOdm = EpisodeOdm.partialToDoc(episode);

    if (Object.keys(partialDocOdm).length === 0)
      throw new Error("Empty partialDocOdm, nothing to patch");

    const seriesId = await this.getSeriesIdStr(compKey.seriesKey);
    const filter = {
      episodeKey: compKey.episodeKey,
      seriesId: new Types.ObjectId(seriesId),
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const updateResult = await EpisodeOdm.Model.findOneAndUpdate(filter, partialDocOdm);

    assertFoundClient(updateResult);

    const episodeId = updateResult._id.toString();

    this.domainEventEmitter.emitPatch(EpisodeEvents.Patched.TYPE, {
      partialEntity: episode,
      id: episodeId,
    } );

    const ret = await this.getOneById(episodeId);

    assertFoundClient(ret);

    return ret;
  }

  async getOneOrCreate(createDto: CreateOneDto): Promise<EpisodeEntity> {
    const createDoc = fixFields(this.createDtoToCreateDoc(createDto));
    const filter = {
      seriesId: createDoc.seriesId,
      episodeKey: createDoc.episodeKey,
    } satisfies MongoFilterQuery<EpisodeOdm.Doc>;
    const update = {
      $setOnInsert: createDoc, // Solo se aplica en la creación
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
      episodeKey: createDto.episodeKey,
      seriesId: new Types.ObjectId(createDto.seriesId),
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

type EpisodeCompKey = {
  seriesKey: string;
  episodeKey: string;
};
