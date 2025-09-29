import { Injectable } from "@nestjs/common";
import { CanGetOneById } from "#utils/layers/repository";
import { UserRoleEntity, UserRoleName } from "../models";
import { UserRoleOdm } from "./repository/odm";

type Entity = UserRoleEntity;

@Injectable()
export class UserRolesRepository implements
CanGetOneById<Entity, Entity["id"]> {
  async getOneById(roleId: UserRoleEntity["id"]): Promise<UserRoleEntity | null> {
    const doc = await UserRoleOdm.Model.findById(roleId);

    if (!doc)
      return null;

    return UserRoleOdm.toEntity(doc);
  }

  async getOneByName(name: UserRoleName): Promise<UserRoleEntity | null> {
    const doc = await UserRoleOdm.Model.findOne( {
      name: name.toString(),
    } );

    if (!doc)
      return null;

    return UserRoleOdm.toEntity(doc);
  }

  async getAll(): Promise<Entity[]> {
    return (await UserRoleOdm.Model.find()).map(UserRoleOdm.toEntity);
  }
}
