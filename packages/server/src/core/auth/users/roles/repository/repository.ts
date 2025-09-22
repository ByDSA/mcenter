import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { UpdateQuery } from "mongoose";
import { assertFoundClient } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { UserRole, UserRoleEntity } from "../repository";
import { UserRoleEvents } from "./events";
import { UserRoleOdm } from "./odm";

type Entity = UserRoleEntity;
type Model = UserRole;

@Injectable()
export class UserRolesRepository
implements
CanPatchOneByIdAndGet<Entity, Entity["id"], UserRole>,
CanGetOneById<Entity, Entity["id"]>,
CanDeleteOneByIdAndGet<Entity, Entity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(UserRoleEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @EmitEntityEvent(UserRoleEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<Entity> {
    const doc = await UserRoleOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    return UserRoleOdm.toEntity(doc);
  }

  async getOneById(id: string): Promise<Entity | null> {
    const doc = await UserRoleOdm.Model.findById(id);

    assertFoundClient(doc);

    return UserRoleOdm.toEntity(doc);
  }

  async patchOneByIdAndGet(id: Entity["id"], params: PatchOneParams<Model>): Promise<Entity> {
    const { entity: validEntity } = params;
    const updateQuery: UpdateQuery<Model> = {
      $set: {
        ...validEntity,
      },
    };
    const doc = await UserRoleOdm.Model.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    );

    assertFoundClient(doc);

    const ret = UserRoleOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(UserRoleEvents.Patched.TYPE, {
      entity: validEntity,
      id,
      unset: params.unset,
    } );

    return ret;
  }

  async getOneByName(name: string): Promise<Entity | null> {
    const doc = await UserRoleOdm.Model.findOne( {
      name,
    } );

    if (!doc)
      return null;

    return UserRoleOdm.toEntity(doc);
  }

  async getAll(): Promise<Entity[]> {
    const docs = await UserRoleOdm.Model.find( {} );
    const ret = docs.map(UserRoleOdm.toEntity);

    return ret;
  }

  @EmitEntityEvent(UserRoleEvents.Created.TYPE)
  async createOneAndGet(userRole: UserRole): Promise<Entity> {
    const docOdm = UserRoleOdm.toDoc(userRole);
    const gotDoc = await UserRoleOdm.Model.create(docOdm);

    return UserRoleOdm.toEntity(gotDoc);
  }
}
