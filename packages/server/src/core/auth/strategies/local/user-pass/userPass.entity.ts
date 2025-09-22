import z from "zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { userEntitySchema, UserEntityWithRoles } from "#core/auth/users/dto/user.dto";

const schema = z.object( {
  userId: mongoDbId,
  username: z.string(),
  password: z.string(),
  createdAt: z.date(),
} );

export type UserPass = z.infer<typeof schema>;

const userPassEntitySchema = schema.extend( {
  id: mongoDbId,
  user: userEntitySchema.optional(),
} );

export type UserPassEntity = z.infer<typeof userPassEntitySchema>;

export type UserPassEntityWithUserWithRoles = UserPassEntity & {
  user: UserEntityWithRoles;
};

export {
  schema as userPassSchema,
  userPassEntitySchema as entitySchema,
};
