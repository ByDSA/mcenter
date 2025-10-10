import z from "zod";
import { mongoDbId } from "../resources/partial-schemas";
import { remotePlayerEntitySchema } from "./remote-player";
import { RemotePlayerDtos } from "./remote-player/dto/domain";

export const remotePlayerConnectionSchema = z.object( {
  id: z.string(),

  // eslint-disable-next-line daproj/max-len
  // TODO Nota importante: Ten en cuenta que la información del cliente (como la IP) puede estar ofuscada si hay proxies o load balancers intermedios. Para obtener la IP real en esos casos, necesitarías revisar headers como x-forwarded-for.
  ip: z.string(),
  remotePlayerId: mongoDbId,
  remotePlayer: remotePlayerEntitySchema.optional(),
  isVlcInstanceOpen: z.boolean(),
} );

export type RemotePlayerConnection = z.infer<typeof remotePlayerConnectionSchema>;

export const initialConnectionsResponseSchema = z.object( {
  remotePlayers: z.array(RemotePlayerDtos.Front.schema),
} );

export type InitialConnectionsResponse = z.infer<typeof initialConnectionsResponseSchema>;

export const newConnectionResponseSchema = z.object( {
  remotePlayer: RemotePlayerDtos.Front.schema,
} );

export type NewConnectionResponse = z.infer<typeof newConnectionResponseSchema>;

export const disconnectionResponseSchema = z.object( {
  connectionId: z.string(),
  remotePlayerId: mongoDbId,
} );

export type DisconnectionResponse = z.infer<typeof disconnectionResponseSchema>;

export const openClosedResponseSchema = z.object( {
  remotePlayerId: mongoDbId,
  open: z.boolean(),
} );

export type OpenClosedResponse = z.infer<typeof openClosedResponseSchema>;
