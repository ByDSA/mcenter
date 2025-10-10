import z from "zod";
import { userEntitySchema } from "../../auth";
import { mongoDbId } from "../../resources/partial-schemas";

export const remotePlayerPermissionSchema = z.object( {
  remotePlayerId: mongoDbId,
  userId: mongoDbId,
  role: z.enum(["owner", "admin", "user"]),
} );

export type RemotePlayerPermission = z.infer<typeof remotePlayerPermissionSchema>;

export const remotePlayerPermissionEntitySchema = remotePlayerPermissionSchema.extend( {
  id: mongoDbId,
  user: userEntitySchema.optional(),
} );

export type RemotePlayerPermissionEntity = z.infer<typeof remotePlayerPermissionEntitySchema>;

export const remotePlayerSchema = z.object( {
  secretToken: z.string().min(1),
  hostName: z.string().min(1),
  ownerId: mongoDbId,
} );

export type RemotePlayer = z.infer<typeof remotePlayerSchema>;

export const remotePlayerEntitySchema = remotePlayerSchema.extend( {
  id: mongoDbId,
  owner: userEntitySchema.optional(),
  permissions: z.array(remotePlayerPermissionSchema).optional(),
} );

export type RemotePlayerEntity = z.infer<typeof remotePlayerEntitySchema>;
