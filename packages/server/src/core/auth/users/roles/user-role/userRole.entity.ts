import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";

const schema = z.object( {
  userId: mongoDbId,
  roleId: mongoDbId,
} );

export type UserRoleMap = z.infer<typeof schema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const entitySchema = schema.extend( {
  id: mongoDbId,
} );

export type UserRoleMapEntity = z.infer<typeof entitySchema>;
