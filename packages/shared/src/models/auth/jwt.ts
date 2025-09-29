import { WithRequired } from "../../utils/objects";
import { UserEntity } from "./user";

export type UserPayload = WithRequired<UserEntity, "roles">;

export type AppPayload = {
  user: UserPayload | null;
  iat?: number; // fecha de emisión
  exp?: number; // fecha de expiración
};
