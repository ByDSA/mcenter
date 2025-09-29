import z from "zod";
import { mongoDbId } from "../resources/partial-schemas";
import { roleEntitySchema } from "./role";

export const userSchema = z.object( {
  email: z.string().email(),
  publicName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailVerified: z.boolean(),
} );

export type User = z.infer<typeof userSchema>;

export const userEntitySchema = userSchema.extend( {
  id: mongoDbId,
  roles: z.array(roleEntitySchema).optional(),
} );

export type UserEntity = z.infer<typeof userEntitySchema>;

export const userEntityWithRolesSchema = userEntitySchema.required( {
  roles: true,
} );

export type UserEntityWithRoles = z.infer<typeof userEntityWithRolesSchema>;
