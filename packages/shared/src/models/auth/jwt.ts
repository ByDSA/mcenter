import z from "zod";
import { userEntityWithRolesSchema } from "./user";

export const userPayloadSchema = userEntityWithRolesSchema.omit( {
  createdAt: true,
  updatedAt: true,
} );

export type UserPayload = z.infer<typeof userPayloadSchema>;

export type AppPayload = {
  user: UserPayload | null;
  iat?: number; // fecha de emisión
  exp?: number; // fecha de expiración
};
