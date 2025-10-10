/* eslint-disable require-await */
import { Injectable, Logger } from "@nestjs/common";
import { RemotePlayerConnection } from "$shared/models/player";
import { WithRequired } from "$shared/utils/objects";
import { RemotePlayerDtos } from "$shared/models/player/remote-player/dto/domain";
import { assertIsDefined } from "$shared/utils/validation";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { FromRemotePlayerEvents } from "./player-services/events";
import { RemotePlayerEntity } from "./player-services/models";

export const remotePlayerConnections: Record<
  RemotePlayerEntity["id"],
  RemotePlayerConnection | null
> = {};

@Injectable()
export class OnlineRemotePlayersService {
  private readonly logger = new Logger("OnlineRemotePlayerService");

  constructor(
private readonly domainEventEmitter: DomainEventEmitter,
  ) {}

  async register(conn: WithRequired<RemotePlayerConnection, "remotePlayer">) {
    remotePlayerConnections[conn.remotePlayerId] = conn;

    this.logger.log(`Remote Player ${conn.remotePlayerId}: connected`);

    this.domainEventEmitter.publish(
      FromRemotePlayerEvents.Connection.create( {
        remotePlayer: mapRemotePlayerToFront(conn.remotePlayer),
      } ),
    );
  }

  async flush(remotePlayerId: string) {
    const oldConnection = remotePlayerConnections[remotePlayerId];

    if (!oldConnection)
      return;

    remotePlayerConnections[remotePlayerId] = null;
    this.logger.log(`Remote player ${remotePlayerId}: disconnected`);
    this.domainEventEmitter.publish(
      FromRemotePlayerEvents.Disconnect.create( {
        connectionId: oldConnection.id,
        remotePlayerId,
      } ),
    );
  }

  async setOpen(remotePlayerId: string, isOpen: boolean) {
    const c = remotePlayerConnections[remotePlayerId];

    assertIsDefined(c);

    const shouldChange = isOpen !== c.isVlcInstanceOpen;

    if (!shouldChange)
      return;

    c.isVlcInstanceOpen = isOpen;

    this.domainEventEmitter.publish(
      FromRemotePlayerEvents.OpenClosed.create( {
        remotePlayerId,
        open: isOpen,
      } ),
    );
  }

  async getAll(): Promise<RemotePlayerConnection[]> {
    return Object.values(remotePlayerConnections)
      .filter(Boolean) as RemotePlayerConnection[];
  }
}

export function mapRemotePlayerToFront(
  remotePlayer: RemotePlayerEntity,
): RemotePlayerDtos.Front.Dto {
  let status: RemotePlayerDtos.Front.Dto["status"];
  const connection = remotePlayerConnections[remotePlayer.id];

  if (connection) {
    if (connection.isVlcInstanceOpen)
      status = "open";
    else
      status = "closed";
  } else
    status = "offline";

  return {
    id: remotePlayer.id,
    publicName: remotePlayer.hostName,
    status,
  };
}
