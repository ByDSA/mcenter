import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { UpdateQuery } from "mongoose";
import { assertFoundClient } from "#utils/validation/found";
import { CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
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
CanPatchOneByIdAndGet<Entity, UserInfoKey>,
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
    params: PatchOneParams<Entity>,
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
      entity,
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
}
