import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { FilterQuery } from "mongoose";
import { showError } from "$shared/utils/errors/showError";
import { EpisodeFileInfo, EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { CanCreateOneAndGet, CanGetAll, CanUpdateMany } from "#utils/layers/repository";
import { ModelMessage, PatchEvent } from "#utils/event-sourcing";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeEntity } from "#episodes/models";
import { assertFound } from "#utils/validation/found";
import { BrokerEvent } from "#utils/message-broker";
import { logDomainEvent } from "#modules/log";
import { EpisodeFileInfoOdm } from "./odm";
import { EPISODE_FILE_INFOS_QUEUE_NAME } from "./events";

type Entity = EpisodeFileInfoEntity;
type Model = EpisodeFileInfo;

type EpisodeId = EpisodeEntity["id"];

export type MessageEvent = BrokerEvent<ModelMessage<Entity>>;

@Injectable()
export class EpisodeFileInfoRepository
implements
CanUpdateMany<Entity>,
CanCreateOneAndGet<Model>,
CanGetAll<Entity> {
  constructor(
    private readonly domainMessageBroker: DomainMessageBroker,
  ) {
    this.domainMessageBroker.subscribe(EPISODE_FILE_INFOS_QUEUE_NAME, (event: MessageEvent) => {
      logDomainEvent(EPISODE_FILE_INFOS_QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);
  }

  async createOneAndGet(model: Model): Promise<Entity> {
    const docOdm = EpisodeFileInfoOdm.toDoc(model);
    const got = await EpisodeFileInfoOdm.Model.create(docOdm);

    return EpisodeFileInfoOdm.docToEntity(got);
  }

  async updateOneByEpisodeId(id: string, model: Entity): Promise<void> {
    const docOdm = EpisodeFileInfoOdm.toDoc(model);

    await EpisodeFileInfoOdm.Model.updateOne( {
      episodeId: id,
    }, docOdm, {
      upsert: true,
    } );
  }

  async patchMany(models: Entity[]): Promise<void> {
    const promises = models.map(model =>this.updateOneByEpisodeId(model.episodeId, model));

    await Promise.all(promises);
  }

  async getAll(): Promise<Entity[]> {
    const modelsOdm = await EpisodeFileInfoOdm.Model.find();

    return modelsOdm.map(EpisodeFileInfoOdm.docToEntity);
  }

  async getAllByEpisodeId(id: EpisodeId): Promise<Entity[]> {
    const modelsOdm = await EpisodeFileInfoOdm.Model.find( {
      episodeId: id,
    } );

    return modelsOdm.map(EpisodeFileInfoOdm.docToEntity);
  }

  async getOneByPath(path: EpisodeFileInfoEntity["path"]): Promise<Entity | null> {
    const doc = await EpisodeFileInfoOdm.Model.findOne( {
      path,
    } );

    if (!doc)
      return null;

    return EpisodeFileInfoOdm.docToEntity(doc);
  }

  async patchOneByPathAndGet(
    path: Entity["path"],
    patchParams: PatchOneParams<Partial<Model>>,
  ): Promise<EpisodeFileInfoEntity | null> {
    return await this.#patchOneAndGet( {
      path,
    }, patchParams);
  }

  async patchOneByIdAndGet(
    id: Entity["id"],
    patchParams: PatchOneParams<Partial<Model>>,
  ): Promise<EpisodeFileInfoEntity | null> {
    return await this.#patchOneAndGet( {
      _id: id,
    }, patchParams);
  }

  async #patchOneAndGet(
    query: FilterQuery<Model>,
    patchParams: PatchOneParams<Partial<Model>>,
  ): Promise<EpisodeFileInfoEntity | null> {
    const partialDocOdm = EpisodeFileInfoOdm.partialToDoc(patchParams.entity);
    const updateResult = await EpisodeFileInfoOdm.Model.findOneAndUpdate(query, partialDocOdm, {
      new: true,
    } );

    assertFound(updateResult);

    const id = updateResult._id.toString();

    for (const [key, value] of Object.entries(patchParams.entity)) {
      const event = new PatchEvent<Model, EpisodeFileInfoEntity["id"]>( {
        entityId: id,
        key: key as keyof Model,
        value,
      } );

      await this.domainMessageBroker.publish(EPISODE_FILE_INFOS_QUEUE_NAME, event);
    }

    return EpisodeFileInfoOdm.docToEntity(updateResult);
  }
}
