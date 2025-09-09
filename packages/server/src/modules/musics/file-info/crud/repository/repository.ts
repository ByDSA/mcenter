import { join, basename, dirname } from "node:path";
import fs from "node:fs";
import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { MusicEntity, MusicId } from "$shared/models/musics";
import { assertIsDefined } from "$shared/utils/validation";
import { FilterQuery } from "mongoose";
import { OnEvent } from "@nestjs/event-emitter";
import { CanCreateOneAndGet, CanDeleteOneById, CanGetAll, CanGetOneById } from "#utils/layers/repository";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent, DomainEventEmitter } from "#core/domain-event-emitter";
import { MusicEvents } from "#musics/crud/repository/events";
import { showError } from "#core/logging/show-error";
import { MUSIC_MEDIA_PATH } from "#musics/utils";
import { assertFoundClient } from "#utils/validation/found";
import { MusicFileInfo, MusicFileInfoEntity } from "../../models";
import { MusicFileInfoOmitMusicIdBuilder } from "../../builder";
import { MusicFileInfoOdm } from "./odm";
import { MusicFileInfoEvents } from "./events";
import { partialModelToDocOdm } from "./odm/adapters";
import { DocOdm } from "./odm/odm";

type Entity = MusicFileInfoEntity;
type Model = MusicFileInfo;

type UpdateOneParams = Model;

@Injectable()
export class MusicFileInfoRepository
implements
CanCreateOneAndGet<Model>,
CanGetAll<Entity>,
CanDeleteOneById<Entity["id"]>,
CanGetOneById<Entity, Entity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) {}

  async deleteOneById(id: string): Promise<void> {
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
  }

  @OnEvent(MusicFileInfoEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(MusicEvents.Deleted.TYPE)
  async handleCreateHistoryEntryEvents(event: MusicEvents.Deleted.Event) {
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

    await this.patchOneByPath(path, updated);

    return updated;
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

  async deleteManyByMusicId(id: MusicEntity["id"]): Promise<void> {
    await MusicFileInfoOdm.Model.deleteMany( {
      musicId: id,
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
        ...partial,
        path,
      } )
      .build();
    const fileInfo: MusicFileInfo = {
      ...fileInfoWithoutMusicId,
      musicId: partial.musicId,
    };
    const updateQuery: Required<Omit<DocOdm, "_id">> = MusicFileInfoOdm.toDoc(fileInfo);

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
      this.domainEventEmitter.emitPatch(
        MusicFileInfoEvents.Patched.TYPE,
        {
          entity:
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
