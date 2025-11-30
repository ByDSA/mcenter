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
import { UserRoleMapEntity, UserRoleMap } from "../userRole.entity";
import { UserRoleMapEvents } from "./events";
import { UserRoleMapOdm } from "./odm";

type Entity = UserRoleMapEntity;
type Model = UserRoleMap;

@Injectable()
export class UserRolesRepository
implements
CanPatchOneByIdAndGet<Entity, Entity["id"], Model>,
CanGetOneById<Entity, Entity["id"]>,
CanDeleteOneByIdAndGet<Entity, Entity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(UserRoleMapEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @EmitEntityEvent(UserRoleMapEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<Entity> {
    const doc = await UserRoleMapOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    return UserRoleMapOdm.toEntity(doc);
  }

  async getOneById(id: string): Promise<Entity | null> {
    const doc = await UserRoleMapOdm.Model.findById(id);

    assertFoundClient(doc);

    return UserRoleMapOdm.toEntity(doc);
  }

  async patchOneByIdAndGet(id: Entity["id"], params: PatchOneParams<Model>): Promise<Entity> {
    const { entity: validEntity } = params;
    const updateQuery: UpdateQuery<Model> = {
      $set: {
        ...validEntity,
      },
    };
    const doc = await UserRoleMapOdm.Model.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    );

    assertFoundClient(doc);

    const ret = UserRoleMapOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(UserRoleMapEvents.Patched.TYPE, {
      partialEntity: validEntity,
      id,
      unset: params.unset,
    } );

    return ret;
  }

  async getOneByName(name: string): Promise<Entity | null> {
    const doc = await UserRoleMapOdm.Model.findOne( {
      name,
    } );

    if (!doc)
      return null;

    return UserRoleMapOdm.toEntity(doc);
  }

  async getAll(): Promise<Entity[]> {
    const docs = await UserRoleMapOdm.Model.find( {} );
    const ret = docs.map(UserRoleMapOdm.toEntity);

    return ret;
  }

  @EmitEntityEvent(UserRoleMapEvents.Created.TYPE)
  async createOneAndGet(userRole: Model): Promise<Entity> {
    const docOdm = UserRoleMapOdm.toDoc(userRole);
    const gotDoc = await UserRoleMapOdm.Model.create(docOdm);

    return UserRoleMapOdm.toEntity(gotDoc);
  }
}
