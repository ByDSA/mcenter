import z from "zod";
import { createZodDto } from "nestjs-zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { roleEntitySchema } from "../roles/repository";

const userDtoSchema = z.object( {
  email: z.string(),

  publicName: z.string(),

  firstName: z.string().optional(),

  lastName: z.string().optional(),

  roles: z.array(z.string()),
} );

export class UserDto extends createZodDto(userDtoSchema) {}
const userSignUpDto = userDtoSchema.omit( {
  roles: true,
} );

export class UserSignUpDto extends createZodDto(userSignUpDto) {}

export const userSchema = z.object( {
  email: z.string().email(),

  publicName: z.string(),

  firstName: z.string().optional(),

  lastName: z.string().optional(),
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
