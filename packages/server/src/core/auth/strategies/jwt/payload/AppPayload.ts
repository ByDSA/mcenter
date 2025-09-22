import { WithRequired } from "$shared/utils/objects";
import { UserEntity } from "../../../users";

export type UserPayload = WithRequired<UserEntity, "roles">;

export type AppPayload = {
  user: UserPayload | null;
  lastPage: string;
  iat?: Date; // fecha de emisión
  exp?: Date; // fecha de expiración
};
