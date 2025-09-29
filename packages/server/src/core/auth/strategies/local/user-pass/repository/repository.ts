import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { assertFoundClient } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { UserPass, UserPassEntity } from "../userPass.entity";
import { UserPassOdm } from "./odm";
import { UserPassEvents } from "./events";

type Entity = UserPassEntity;
type Model = UserPass;

@Injectable()
export class UserPassesRepository
implements
CanPatchOneByIdAndGet<Entity, Entity["id"], Model>,
CanGetOneById<Entity, Entity["id"]>,
CanDeleteOneByIdAndGet<Entity, Entity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(UserPassEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @EmitEntityEvent(UserPassEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<Entity> {
    const doc = await UserPassOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    return UserPassOdm.toEntity(doc);
  }

  async getOneById(id: string): Promise<Entity | null> {
    const doc = await UserPassOdm.Model.findById(id);

    if (!doc)
      return null;

    return UserPassOdm.toEntity(doc);
  }

  async getOneByUserId(userId: string): Promise<Entity | null> {
    const doc = await UserPassOdm.Model.findOne( {
      userId,
    } );

    if (!doc)
      return null;

    return UserPassOdm.toEntity(doc);
  }

  async getOneByVerificationToken(token: string): Promise<Entity | null> {
    const doc = await UserPassOdm.Model.findOne( {
      verificationToken: token,
    } );

    if (!doc)
      return null;

    return UserPassOdm.toEntity(doc);
  }

  async getOneByUsername(username: string): Promise<Entity | null> {
    const doc = await UserPassOdm.Model.findOne( {
      username,
    } );

    if (!doc)
      return null;

    return UserPassOdm.toEntity(doc);
  }

  async patchOneByIdAndGet(id: Entity["id"], params: PatchOneParams<Model>): Promise<Entity> {
    const { entity: paramEntity } = params;
    const validEntity = paramEntity;
    const updateQuery = patchParamsToUpdateQuery( {
      ...params,
      entity: validEntity,
    }, UserPassOdm.partialToDoc);

    updateQuery.$set = {
      ...updateQuery.$set,
    };
    updateQuery.$unset = {
      ...updateQuery.$unset,
    };

    const doc = await UserPassOdm.Model.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    );

    assertFoundClient(doc);

    const ret = UserPassOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(UserPassEvents.Patched.TYPE, {
      entity: validEntity,
      id,
      unset: params.unset,
    } );

    return ret;
  }

  @EmitEntityEvent(UserPassEvents.Created.TYPE)
  async createOneAndGet(userPass: UserPass): Promise<Entity> {
    const docOdm = UserPassOdm.toDoc(userPass);
    const gotDoc = await UserPassOdm.Model.create(docOdm);

    return UserPassOdm.toEntity(gotDoc);
  }

  @EmitEntityEvent(UserPassEvents.Deleted.TYPE)
  async deleteOneByUserId(userId: Entity["userId"]): Promise<Entity | null> {
    const docOdm = await UserPassOdm.Model.findOneAndDelete( {
      userId,
    } );

    assertFoundClient(docOdm, "UserPass not found");

    return UserPassOdm.toEntity(docOdm);
  }
}
