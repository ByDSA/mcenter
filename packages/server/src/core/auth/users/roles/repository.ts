import z from "zod";
import { Injectable } from "@nestjs/common";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { CanGetOneById } from "#utils/layers/repository";
import { UserRoleName } from "./role";
import { UserRoleOdm } from "./repository/odm";

type Entity = UserRoleEntity;

export const userRoleSchema = z.object( {
  name: z.nativeEnum(UserRoleName),
} );

export type UserRole = z.infer<typeof userRoleSchema>;

export const roleEntitySchema = userRoleSchema.extend( {
  id: mongoDbId,
} );

export type UserRoleEntity = z.infer<typeof roleEntitySchema>;

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
