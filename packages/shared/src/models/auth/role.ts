import z from "zod";
import { mongoDbId } from "../resources/partial-schemas";

export enum UserRoleName {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
  UPLOADER = "uploader"
}

const ROLE_VALUES = Object.freeze(Object.values(UserRoleName));

export function parseUserRole(role: string): UserRoleName {
  if (!ROLE_VALUES.includes(role as UserRoleName)) {
    throw new Error(
      `Invalid role: ${role}. Expected one of: ${ROLE_VALUES.join(", ")}`,
    );
  }

  return role as UserRoleName;
}

export const userRoleSchema = z.object( {
  name: z.nativeEnum(UserRoleName),
} );

export type UserRole = z.infer<typeof userRoleSchema>;

export const roleEntitySchema = userRoleSchema.extend( {
  id: mongoDbId,
} );

export type UserRoleEntity = z.infer<typeof roleEntitySchema>;
