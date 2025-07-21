import { Injectable } from "@nestjs/common";
import { MusicEntity, MusicId } from "$shared/models/musics";
import { assertIsDefined, assertIsNotEmpty } from "$shared/utils/validation";
import { FilterQuery } from "mongoose";
import { CanCreateOneAndGet, CanGetAll, CanUpdateMany } from "#utils/layers/repository";
import { PatchEvent } from "#utils/event-sourcing";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { getFullPath } from "#musics/utils";
import { md5FileAsync } from "#utils/crypt";
import { MusicFileInfo, MusicFileInfoEntity } from "../models";
import { MusicFileInfoOdm } from "./odm";
import { MUSIC_FILE_INFOS_QUEUE_NAME } from "./events";
import { partialModelToDocOdm } from "./odm/adapters";
import { DocOdm } from "./odm/odm";

type Entity = MusicFileInfoEntity;
type Model = MusicFileInfo;

type UpdateOneParams = Model;

@Injectable()
export class MusicFileInfoRepository
implements
CanUpdateMany<Entity>,
CanCreateOneAndGet<Model>,
CanGetAll<Entity> {
  constructor(
    private readonly domainMessageBroker: DomainMessageBroker,
  ) {}

  async updateHashOfMusic(music: MusicEntity) {
    const currentFileInfos = await this.getAllByMusicId(music.id);

    assertIsNotEmpty(currentFileInfos);
    const currentFileInfo = currentFileInfos[0];
    const hash = await md5FileAsync(getFullPath(currentFileInfo.path));

    await this.patchOneByPath(currentFileInfo.path, {
      hash,
    } );

    return hash;
  }

  async createOneAndGet(model: Model): Promise<Entity> {
    const docOdm = MusicFileInfoOdm.toDoc(model);
    const got = await MusicFileInfoOdm.Model.create(docOdm);

    return MusicFileInfoOdm.toEntity(got);
  }

  async patchOneByPath(path: string, model: Partial<Model>): Promise<void> {
    const docOdm = partialModelToDocOdm(model);

    await MusicFileInfoOdm.Model.updateOne( {
      path,
    }, docOdm);
  }

  async deleteOneByPath(path: string): Promise<void> {
    await MusicFileInfoOdm.Model.deleteOne( {
      path,
    } );
  }

  async patchMany(models: Entity[]): Promise<void> {
    const promises = models.map(model =>this.patchOneByPath(model.path, model));

    await Promise.all(promises);
  }

  async getAll(): Promise<Entity[]> {
    const modelsOdm = await MusicFileInfoOdm.Model.find();

    return modelsOdm.map(MusicFileInfoOdm.toEntity);
  }

  async getAllByMusicId(musicId: MusicId): Promise<Entity[]> {
    const modelsOdm = await MusicFileInfoOdm.Model.find( {
      musicId,
    } );

    return modelsOdm.map(MusicFileInfoOdm.toEntity);
  }

  async getOneByMusicId(musicId: MusicId): Promise<Entity | null> {
    const modelOdm = await MusicFileInfoOdm.Model.findOne( {
      musicId,
    } );

    if (!modelOdm)
      return null;

    return MusicFileInfoOdm.toEntity(modelOdm);
  }

  async upsertOneAndGet(fileInfo: MusicFileInfo): Promise<MusicFileInfoEntity> {
    return await this.upsertOneByPathAndGet(fileInfo.path, fileInfo);
  }

  async upsertOneByPathAndGet(
    path: MusicFileInfoEntity["path"],
    fileInfo: MusicFileInfo,
  ): Promise<MusicFileInfoEntity> {
    const filterQuery: FilterQuery<DocOdm> = {
      path,
    };
    const updateQuery: Required<Omit<DocOdm, "_id">> = MusicFileInfoOdm.toDoc(fileInfo);
    const result = await MusicFileInfoOdm.Model.findOneAndUpdate(filterQuery, updateQuery, {
      upsert: true, // lo crea si no existe
      new: true,
    } );

    assertIsDefined(result);

    return MusicFileInfoOdm.toEntity(result);
  }

  async getOneByPath(path: Entity["path"]): Promise<Entity | null> {
    const modelOdm = await MusicFileInfoOdm.Model.findOne( {
      path,
    } );

    if (!modelOdm)
      return null;

    return MusicFileInfoOdm.toEntity(modelOdm);
  }

  async patchOneByPathAndGet(
    path: Entity["path"],
    fileInfo: Partial<UpdateOneParams>,
  ): Promise<Entity | null> {
    const partialDocOdm = MusicFileInfoOdm.partialToDoc(fileInfo);
    const result = await MusicFileInfoOdm.Model.updateOne( {
      path,
    }, partialDocOdm);

    if (result.matchedCount === 0 || result.acknowledged === false)
      return null;

    const newPath = fileInfo.path ?? path;
    const ret = await this.getOneByPath(newPath);

    if (ret) {
      const event = new PatchEvent<Model, MusicId>( {
        entityId: ret.id,
        key: "path",
        value: newPath,
      } );

      await this.domainMessageBroker.publish(MUSIC_FILE_INFOS_QUEUE_NAME, event);
    }

    return ret;
  }
}
