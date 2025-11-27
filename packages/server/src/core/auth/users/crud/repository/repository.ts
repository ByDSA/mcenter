import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { assertIsDefined } from "$shared/utils/validation";
import { assertFoundClient } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { UserRoleMapOdm } from "../../roles/user-role/repository/odm";
import { UserRoleOdm } from "../../roles/repository/odm";
import { User, UserEntity } from "../../models";
import { AlreadyExistsEmailException, isMongoErrorDupEmail } from "./errors";
import { UserOdm } from "./odm";
import { UserEvents } from "./events";

type Entity = UserEntity;
type Model = User;
export type CriteriaOne = {
  expand?: ("roles")[];
  filter?: Partial<Record<keyof Model, any>>;
};

@Injectable()
export class UsersRepository
implements
CanPatchOneByIdAndGet<Entity, Entity["id"], Model>,
CanGetOneById<Entity, Entity["id"]>,
CanDeleteOneByIdAndGet<Entity, Entity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(UserEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @EmitEntityEvent(UserEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<Entity> {
    const doc = await UserOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    return UserOdm.toEntity(doc);
  }

  async getOneById(id: string, criteria?: Omit<CriteriaOne, "filter">): Promise<Entity | null> {
    const doc = await UserOdm.Model.findById(id) as UserOdm.FullDoc;

    assertFoundClient(doc);

    if (criteria?.expand?.includes("roles"))
      await this.#expandRoles(doc);

    return UserOdm.toEntity(doc);
  }

  async #expandRoles(doc: UserOdm.FullDoc): Promise<UserOdm.FullDoc> {
    const map = await UserRoleMapOdm.Model.find( {
      userId: doc._id,
    } );

    doc.roles = [];

    for (const { roleId } of map) {
      const role = await UserRoleOdm.Model.findById(roleId);

      assertIsDefined(role);
      doc.roles.push(role);
    }

    return doc as UserOdm.FullDoc;
  }

  async getOneByEmail(
    email: string,
    criteria?: Omit<CriteriaOne, "filter">,
  ): Promise<UserEntity | null> {
    return await this.getOne( {
      ...criteria,
      filter: {
        email,
      },
    } );
  }

  async patchOneByIdAndGet(id: Entity["id"], params: PatchOneParams<Model>): Promise<Entity> {
    const { entity: paramEntity } = params;
    const validEntity = paramEntity;
    const updateQuery = patchParamsToUpdateQuery( {
      ...params,
      entity: validEntity,
    }, UserOdm.partialToDoc);

    updateQuery.$set = {
      ...updateQuery.$set,
    };

    const doc = await UserOdm.Model.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    );

    assertFoundClient(doc);

    const ret = UserOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(UserEvents.Patched.TYPE, {
      entity: validEntity,
      id,
      unset: params.unset,
    } );

    return ret;
  }

  async getOne(criteria: CriteriaOne): Promise<Entity | null> {
    const doc = await UserOdm.Model.findOne(criteria.filter);

    if (!doc)
      return null;

    if (criteria?.expand?.includes("roles"))
      await this.#expandRoles(doc);

    return UserOdm.toEntity(doc);
  }

  async getAll(): Promise<Entity[]> {
    const docs = await UserOdm.Model.find( {} );
    const ret = docs.map(UserOdm.toEntity);

    return ret;
  }

  @EmitEntityEvent(UserEvents.Created.TYPE)
  async createOneAndGet(user: User): Promise<Entity> {
    const docOdm = UserOdm.toDoc(user);

    try {
      const gotDoc = await UserOdm.Model.create(docOdm);

      return UserOdm.toEntity(gotDoc);
    } catch (e) {
      if (isMongoErrorDupEmail(e))
        throw new AlreadyExistsEmailException();

      throw e;
    }
  }

  @EmitEntityEvent(UserEvents.Deleted.TYPE)
  async deleteOneByPath(relativePath: string): Promise<Entity | null> {
    const docOdm = await UserOdm.Model.findOneAndDelete( {
      path: relativePath,
    } );

    assertFoundClient(docOdm, "User not found");

    return UserOdm.toEntity(docOdm);
  }
}
