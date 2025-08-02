import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { FilterQuery } from "mongoose";
import { OnEvent } from "@nestjs/event-emitter";
import { EpisodeFileInfoEvents } from "./events";
import { EpisodeFileInfoOdm } from "./odm";
import { EpisodeFileInfo, EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { CanCreateOneAndGet, CanGetAll } from "#utils/layers/repository";
import { DomainEvent, DomainEventEmitter } from "#main/domain-event-emitter";
import { EpisodeEntity } from "#episodes/models";
import { assertFound } from "#utils/validation/found";
import { MongoFilterQuery, patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { logDomainEvent } from "#main/logging/log-domain-event";

type Entity = EpisodeFileInfoEntity;
type Model = EpisodeFileInfo;

type EpisodeId = EpisodeEntity["id"];

@Injectable()
export class EpisodeFileInfoRepository
implements
CanCreateOneAndGet<Model>,
CanGetAll<Entity> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) {
  }

  @OnEvent(EpisodeFileInfoEvents.WILDCARD)
  handleLog(event: DomainEvent<unknown>): void {
    logDomainEvent(event);
  }

  async createOneAndGet(model: Model): Promise<Entity> {
    const docOdm = EpisodeFileInfoOdm.toDoc(model);
    const got = await EpisodeFileInfoOdm.Model.create(docOdm);

    return EpisodeFileInfoOdm.toEntity(got);
  }

  async updateOneByEpisodeId(id: string, model: Entity): Promise<void> {
    const docOdm = EpisodeFileInfoOdm.toDoc(model);
    const filter = {
      episodeId: id,
    } satisfies MongoFilterQuery<EpisodeFileInfoOdm.Doc>;

    await EpisodeFileInfoOdm.Model.updateOne(filter, docOdm, {
      upsert: true,
    } );
  }

  async getAll(): Promise<Entity[]> {
    const modelsOdm = await EpisodeFileInfoOdm.Model.find();

    return modelsOdm.map(EpisodeFileInfoOdm.toEntity);
  }

  async getAllByEpisodeId(id: EpisodeId): Promise<Entity[]> {
    const filter = {
      episodeId: id,
    } satisfies MongoFilterQuery<EpisodeFileInfoOdm.Doc>;
    const modelsOdm = await EpisodeFileInfoOdm.Model.find(filter);

    return modelsOdm.map(EpisodeFileInfoOdm.toEntity);
  }

  async getOneByPath(path: EpisodeFileInfoEntity["path"]): Promise<Entity | null> {
    const doc = await EpisodeFileInfoOdm.Model.findOne( {
      path,
    } );

    if (!doc)
      return null;

    return EpisodeFileInfoOdm.toEntity(doc);
  }

  async patchOneByPathAndGet(
    path: Entity["path"],
    patchParams: PatchOneParams<Partial<Model>>,
  ): Promise<EpisodeFileInfoEntity> {
    return await this.#patchOneAndGet( {
      path,
    }, patchParams);
  }

  async patchOneByIdAndGet(
    id: Entity["id"],
    patchParams: PatchOneParams<Partial<Model>>,
  ): Promise<EpisodeFileInfoEntity> {
    return await this.#patchOneAndGet( {
      _id: id,
    }, patchParams);
  }

  async #patchOneAndGet(
    query: FilterQuery<Model>,
    params: PatchOneParams<Model>,
  ): Promise<EpisodeFileInfoEntity> {
    const updateQuery = patchParamsToUpdateQuery(params, EpisodeFileInfoOdm.partialToDoc);
    const updateResult = await EpisodeFileInfoOdm.Model.findOneAndUpdate(query, updateQuery, {
      new: true,
    } );

    assertFound(updateResult);

    const id = updateResult._id.toString();

    this.domainEventEmitter.emitPatch(
      EpisodeFileInfoEvents.Patch.TYPE,
      {
        entity: params.entity,
        id,
        unset: params.unset,
      },
    );

    return EpisodeFileInfoOdm.toEntity(updateResult);
  }
}
