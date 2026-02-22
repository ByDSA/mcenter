import { join, basename, dirname } from "node:path";
import fs from "node:fs";
import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { MusicEntity, MusicId } from "$shared/models/musics";
import { assertIsDefined } from "$shared/utils/validation";
import { FilterQuery, Types, UpdateQuery } from "mongoose";
import { OnEvent } from "@nestjs/event-emitter";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { CanCreateOneAndGet, CanGetAll, CanGetOneById } from "#utils/layers/repository";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent, DomainEventEmitter } from "#core/domain-event-emitter";
import { MusicEvents } from "#musics/crud/repositories/music/events";
import { showError } from "#core/logging/show-error";
import { MUSIC_MEDIA_PATH } from "#musics/utils";
import { assertFoundClient } from "#utils/validation/found";
import { MongoFilterQuery } from "#utils/layers/db/mongoose";
import { MusicFileInfo, MusicFileInfoEntity } from "../../models";
import { MusicFileInfoOmitMusicIdBuilder } from "../../builder";
import { MusicFileInfoOdm } from "./odm";
import { MusicFileInfoEvents } from "./events";
import { DocOdm } from "./odm/odm";

type Entity = MusicFileInfoEntity;
type CreateOneDto = MusicFileInfoCrudDtos.CreateOne.Body;
type PatchOneDto = MusicFileInfoCrudDtos.PatchOne.Body;

@Injectable()
export class MusicFileInfoRepository
implements
CanCreateOneAndGet<CreateOneDto>,
CanGetAll<Entity>,
CanGetOneById<Entity, Entity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) {}

  async deleteOneById(id: string): Promise<Entity> {
    const fileInfo = await MusicFileInfoOdm.Model.findById(id);

    assertFoundClient(fileInfo);
    const { musicId } = fileInfo;
    const count = await MusicFileInfoOdm.Model.count( {
      musicId: musicId,
    } );
    const moreThanOne = count > 1;

    if (!moreThanOne) {
      throw new UnprocessableEntityException(
        "No se puede eliminar el último archivo de una música. Elimine la \
música si desea borrar el archivo.",
      );
    }

    // Mover archivo
    const absPath = join(MUSIC_MEDIA_PATH, fileInfo.path);
    const filename = basename(absPath);
    const newPath = join(MUSIC_MEDIA_PATH, "..", "deleted", filename);

    await fs.promises.mkdir(dirname(newPath), {
      recursive: true,
    } );
    await fs.promises.rename(absPath, newPath);

    // Borrar de db
    await MusicFileInfoOdm.Model.deleteOne( {
      _id: id,
    } );

    return MusicFileInfoOdm.toEntity(fileInfo);
  }

  @OnEvent(MusicFileInfoEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(MusicEvents.Deleted.TYPE)
  async handleDeleteMusic(event: MusicEvents.Deleted.Event) {
    const { entity } = event.payload;

    await this.deleteManyByMusicId(entity.id)
      .catch(showError);
  }

  async getOneById(id: Entity["id"]): Promise<Entity | null> {
    const modelOdm = await MusicFileInfoOdm.Model.findById(id);

    if (!modelOdm)
      return null;

    return MusicFileInfoOdm.toEntity(modelOdm);
  }

  async updateMetadata(id: Entity["id"]) {
    const fileInfo = await this.getOneById(id);

    assertIsDefined(fileInfo);
    const { path } = fileInfo;
    const updated = await new MusicFileInfoOmitMusicIdBuilder().withPartial( {
      path,
    } )
      .build();

    await this.patchOneByPath(path, {
      entity: updated,
    } );

    return updated;
  }

  async createOneAndGet(model: CreateOneDto): Promise<Entity> {
    const docOdm = MusicFileInfoOdm.partialToDoc(model);
    const got = await MusicFileInfoOdm.Model.create(docOdm);

    return MusicFileInfoOdm.toEntity(got);
  }

  async patchOneByPath(path: string, dto: PatchOneDto): Promise<Entity> {
    const docOdm = MusicFileInfoOdm.partialToDoc(dto.entity);
    const ret = await MusicFileInfoOdm.Model.findByIdAndUpdate( {
      path,
    }, docOdm, {
      new: true,
    } );

    assertFoundClient(ret);

    this.domainEventEmitter.emitPatch(MusicFileInfoEvents.Patched.TYPE, {
      partialEntity: dto.entity,
      id: ret.id,
      unset: dto.unset,
    } );

    return MusicFileInfoOdm.toEntity(ret);
  }

  async patchOneById(id: string, dto: PatchOneDto): Promise<Entity> {
    const docOdm = MusicFileInfoOdm.partialToDoc(dto.entity);
    const update: UpdateQuery<Entity> = {
      $set: docOdm,
    };

    if (dto.unset?.length)
      update.$unset = Object.fromEntries(dto.unset.map((field) => [field, ""]));

    const ret = await MusicFileInfoOdm.Model.findByIdAndUpdate(id, update, {
      new: true,
    } );

    assertFoundClient(ret);

    this.domainEventEmitter.emitPatch(MusicFileInfoEvents.Patched.TYPE, {
      partialEntity: dto.entity,
      id,
      unset: dto.unset,
    } );

    return MusicFileInfoOdm.toEntity(ret);
  }

  async deleteOneByPath(path: string): Promise<void> {
    await MusicFileInfoOdm.Model.deleteOne( {
      path,
    } );
  }

  async deleteManyByMusicId(id: MusicEntity["id"]): Promise<void> {
    await MusicFileInfoOdm.Model.deleteMany( {
      musicId: new Types.ObjectId(id),
    } );
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

  async getManyByIds(ids: string[]): Promise<Entity[]> {
    const filter = {
      _id: {
        $in: ids.map(id => new Types.ObjectId(id)),
      },
    } satisfies MongoFilterQuery<DocOdm>;
    const modelsOdm = await MusicFileInfoOdm.Model.find(filter);

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
    partial: Partial<MusicFileInfo> & Required<Pick<MusicFileInfo, "musicId">>,
  ): Promise<MusicFileInfoEntity> {
    const filterQuery: FilterQuery<DocOdm> = {
      path,
    };
    const fileInfoWithoutMusicId = await new MusicFileInfoOmitMusicIdBuilder()
      .withPartial( {
        path,
        ...partial,
      } )
      .build();
    const fileInfo: MusicFileInfo = {
      ...fileInfoWithoutMusicId,
      musicId: partial.musicId,
    };
    const updateQuery = MusicFileInfoOdm.partialToDoc(fileInfo);

    try {
      const result = await MusicFileInfoOdm.Model.findOneAndUpdate(filterQuery, updateQuery, {
        upsert: true, // lo crea si no existe
        new: true,
      } );

      assertIsDefined(result);

      return MusicFileInfoOdm.toEntity(result);
    } catch (e) {
      if (!(e instanceof Error))
        throw e;

      if (e.message.includes("E11000 duplicate key error collection")) {
        if (e.message.includes("index: hash"))
          throw new UnprocessableEntityException("A file with the same hash already exists.");

        throw new UnprocessableEntityException("A file with some same key already exists.");
      }

      throw e;
    }
  }

  async getOneByPath(path: Entity["path"]): Promise<Entity | null> {
    const modelOdm = await MusicFileInfoOdm.Model.findOne( {
      path,
    } );

    if (!modelOdm)
      return null;

    return MusicFileInfoOdm.toEntity(modelOdm);
  }

  async getOneByHash(hash: string): Promise<Entity | null> {
    const modelOdm = await MusicFileInfoOdm.Model.findOne( {
      hash,
    } );

    if (!modelOdm)
      return null;

    return MusicFileInfoOdm.toEntity(modelOdm);
  }

  async patchOneByPathAndGet(
    path: Entity["path"],
    fileInfo: PatchOneDto,
  ): Promise<Entity | null> {
    const partialDocOdm = MusicFileInfoOdm.partialToDoc(fileInfo.entity);
    const result = await MusicFileInfoOdm.Model.updateOne( {
      path,
    }, partialDocOdm);

    if (result.matchedCount === 0 || result.acknowledged === false)
      return null;

    const newPath = fileInfo.entity.path ?? path;
    const ret = await this.getOneByPath(newPath);

    if (ret) {
      this.domainEventEmitter.emitPatch(
        MusicFileInfoEvents.Patched.TYPE,
        {
          partialEntity:
        {
          path: newPath,
        },
          id: ret.id,
        },
      );
    }

    return ret;
  }
}
