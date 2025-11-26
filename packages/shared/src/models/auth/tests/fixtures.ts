/* eslint-disable @typescript-eslint/naming-convention */
import mongoose from "mongoose";
import { UserEntity, UserEntityWithRoles } from "../user";
import { UserRoleEntity, UserRoleName } from "../role";

const admin = {
  id: new mongoose.Types.ObjectId().toString(),
  publicName: "Admin",
  email: "test@mail.com",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  musics: {
    favoritesPlaylistId: null,
  },
} satisfies UserEntity;
const normal = {
  id: new mongoose.Types.ObjectId().toString(),
  publicName: "Normal user",
  email: "test2@mail.com",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  musics: {
    favoritesPlaylistId: null,
  },
} satisfies UserEntity;
const adminRole = {
  id: new mongoose.Types.ObjectId().toString(),
  name: UserRoleName.ADMIN,
} satisfies UserRoleEntity;
const userRole = {
  id: new mongoose.Types.ObjectId().toString(),
  name: UserRoleName.USER,
} satisfies UserRoleEntity;
const Admin = {
  User: admin,
  Roles: [adminRole, userRole],
  UserWithRoles: {
    ...admin,
    roles: [adminRole, userRole],
  } satisfies UserEntityWithRoles,
  UserRoleMap: [
    {
      userId: admin.id,
      roleId: adminRole.id,
    },
    {
      userId: admin.id,
      roleId: userRole.id,
    },
  ],
};
const Normal = {
  User: normal,
  Roles: [userRole],
  UserWithRoles: {
    ...normal,
    roles: [userRole],
  } satisfies UserEntityWithRoles,
  UserRoleMap: [
    {
      userId: normal.id,
      roleId: userRole.id,
    },
  ],
};

export const fixtureUsers = {
  AllUsers: [
    admin,
    normal,
  ],
  AllRoles: [
    adminRole,
    userRole,
  ],
  Admin,
  Normal,
  All: [
    Admin,
    Normal,
  ],
};
