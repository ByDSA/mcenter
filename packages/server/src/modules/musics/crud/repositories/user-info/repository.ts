import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Types, UpdateQuery } from "mongoose";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { MusicInfoCrudDtos } from "$shared/models/musics/user-info/dto/transport";
import { assertFoundClient } from "#utils/validation/found";
import { CanGetOneById } from "#utils/layers/repository";
import { MusicEntity, MusicUserInfoEntity } from "#musics/models";
import { showError } from "#core/logging/show-error";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicHistoryEntryEvents } from "../../../history/crud/repository/events";
import { MusicsUsersEvents } from "./events";
import { MusicsUsersOdm } from "./odm";

type Entity = MusicUserInfoEntity;

type UserInfoKey = {
  musicId: MusicEntity["id"];
  userId: string;
};

@Injectable()
export class MusicsUsersRepository
implements
CanGetOneById<Entity, UserInfoKey> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(MusicsUsersEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(MusicHistoryEntryEvents.Created.TYPE)
  async handleCreateHistoryEntryEvents(event: MusicHistoryEntryEvents.Created.Event) {
    const { entity } = event.payload;

    await this.patchOneByIdAndGet( {
      musicId: entity.resourceId,
      userId: event.payload.entity.userId,
    }, {
      entity: {
        lastTimePlayed: entity.date.timestamp,
      },
    } ).catch(showError);
  }

  async getOneById( { musicId, userId }: UserInfoKey): Promise<Entity | null> {
    const doc = await MusicsUsersOdm.Model.findOne( {
      musicId,
      userId,
    } );

    assertFoundClient(doc);

    return MusicsUsersOdm.toEntity(doc);
  }

  async patchOneByIdAndGet(
    key: UserInfoKey,
    params: MusicInfoCrudDtos.Patch.Body,
  ): Promise<Entity> {
    const { entity } = params;
    const updateQuery: UpdateQuery<MusicsUsersOdm.Doc> = {
      $set: {
        ...entity,
      },
    };

    if (updateQuery.$set?.tags?.length === 0)
      delete updateQuery.$set.tags;

    if (entity.tags?.length === 0) {
      updateQuery.$unset = {
        ...updateQuery.$unset,
        tags: true,
      };
    }

    const doc = await MusicsUsersOdm.Model.findOneAndUpdate(
      {
        musicId: key.musicId,
        userId: key.userId,
      },
      {
        ...updateQuery,
        $setOnInsert: {
          musicId: key.musicId,
          userId: key.userId,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    assertFoundClient(doc);

    const ret = MusicsUsersOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(MusicsUsersEvents.Patched.TYPE, {
      partialEntity: entity,
      id: {
        musicId: key.musicId,
        userId: key.userId,
        _id: ret.id,
      } satisfies MusicsUsersEvents.Patched.Event["payload"]["entityId"],
      unset: params.unset,
    } );

    return ret;
  }

  @EmitEntityEvent(MusicsUsersEvents.Created.TYPE)
  async createOneAndGet(entity: Entity): Promise<Entity> {
    const docOdm = MusicsUsersOdm.toDoc(entity);
    const gotDoc = await MusicsUsersOdm.Model.create(docOdm);

    return MusicsUsersOdm.toEntity(gotDoc);
  }

  async patchManyByMusicIds(
    musicIds: string[],
    userId: string,
    params: MusicInfoCrudDtos.Patch.Body,
  ): Promise<{ data: MusicUserInfoEntity[];
warnings: MusicCrudDtos.BulkPatch.Warning[]; }> {
    const { entity } = params;
    const updateQuery: UpdateQuery<MusicsUsersOdm.Doc> = {
      $set: {
        ...entity,
      },
    };

    if (updateQuery.$set?.tags?.length === 0)
      delete updateQuery.$set.tags;

    if (entity.tags?.length === 0) {
      updateQuery.$unset = {
        ...updateQuery.$unset,
        tags: true,
      };
    }

    const bulkOps = musicIds.map((musicId) => ( {
      updateOne: {
        filter: {
          musicId: new Types.ObjectId(musicId),
          userId: new Types.ObjectId(userId),
        },
        update: {
          ...updateQuery,
          $setOnInsert: {
            musicId: new Types.ObjectId(musicId),
            userId: new Types.ObjectId(userId),
          },
        },
        upsert: true,
      },
    } ));

    await MusicsUsersOdm.Model.bulkWrite(bulkOps);

    const docs = await MusicsUsersOdm.Model.find( {
      musicId: {
        $in: musicIds.map((id) => new Types.ObjectId(id)),
      },
      userId: new Types.ObjectId(userId),
    } );
    const data = docs.map(MusicsUsersOdm.toEntity);
    // Con upsert activo esto no debería ocurrir, pero se detecta por consistencia
    const foundMusicIds = new Set(data.map((item) => item.musicId));
    const notFoundMusicIds = musicIds.filter((id) => !foundMusicIds.has(id));
    const warnings: MusicCrudDtos.BulkPatch.Warning[] = [];

    if (notFoundMusicIds.length > 0) {
      warnings.push( {
        code: "USER_INFO_IDS_NOT_FOUND",
        notFoundMusicIds,
      } );
    }

    for (const item of data) {
      this.domainEventEmitter.emitPatch(MusicsUsersEvents.Patched.TYPE, {
        partialEntity: entity,
        id: {
          musicId: item.musicId,
          userId: item.userId,
          _id: item.id,
        } satisfies MusicsUsersEvents.Patched.Event["payload"]["entityId"],
        unset: params.unset,
      } );
    }

    return {
      data,
      warnings,
    };
  }
}
