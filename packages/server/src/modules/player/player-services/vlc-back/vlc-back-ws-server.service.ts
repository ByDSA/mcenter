/* eslint-disable require-await */
import assert from "node:assert";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { OnEvent } from "@nestjs/event-emitter";
import { WithRequired } from "$shared/utils/objects";
import { PlayerStatusResponse } from "$shared/models/player";
import { ToRemotePlayerEvent, PlayResourceMessage, FromRemotePlayerEvent, RemotePlayerConnection } from "#modules/player/player-services/models";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { OnlineRemotePlayersService } from "#modules/player/online-remote-players.service";
import { ToRemotePlayerEvents, FromRemotePlayerEvents } from "../events";
import { RemotePlayersRepository } from "../repository";

@Injectable()
export class VlcBackWSService {
  io: Server | undefined;

  private readonly logger = new Logger("Player-VLC");

  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    private readonly remotePlayersService: OnlineRemotePlayersService,
    private readonly repo: RemotePlayersRepository,
  ) { }

  @OnEvent(ToRemotePlayerEvents.WILDCARD)
  async handleEvents(event: ToRemotePlayerEvents.Empty.Event) {
    assertIsDefined(this.io);
    const { remotePlayerId } = event.payload;

    assertIsDefined(remotePlayerId);

    const op = this.io
      .to(remotePlayerRoom(remotePlayerId));

    switch (event.type) {
      case ToRemotePlayerEvents.getEventEmitterType(ToRemotePlayerEvent.PAUSE_TOGGLE):
        op.emit(ToRemotePlayerEvent.PAUSE_TOGGLE);
        break;
      case ToRemotePlayerEvents.getEventEmitterType(ToRemotePlayerEvent.NEXT):
        op.emit(ToRemotePlayerEvent.NEXT);
        break;
      case ToRemotePlayerEvents.getEventEmitterType(ToRemotePlayerEvent.PREVIOUS):
        op.emit(ToRemotePlayerEvent.PREVIOUS);
        break;
      case ToRemotePlayerEvents.getEventEmitterType(ToRemotePlayerEvent.STOP):
        op.emit(ToRemotePlayerEvent.STOP);
        break;
      case ToRemotePlayerEvents.getEventEmitterType(ToRemotePlayerEvent.SEEK):
        op.emit(
          ToRemotePlayerEvent.SEEK,
          (event as ToRemotePlayerEvents.Seek.Event).payload.value,
        );
        break;
      case ToRemotePlayerEvents.getEventEmitterType(ToRemotePlayerEvent.PLAY):
        op.emit(
          ToRemotePlayerEvent.PLAY,
          (event as ToRemotePlayerEvents.Play.Event).payload.id,
        );
        break;
      case ToRemotePlayerEvents.getEventEmitterType(ToRemotePlayerEvent.FULLSCREEN_TOGGLE):
        op
          .emit(ToRemotePlayerEvent.FULLSCREEN_TOGGLE);
        break;
      default:
        break;
    }

    return Promise.resolve();
  }

  startSocket(httpServer: HttpServer) {
    assert(!this.io, "Server already started");

    this.io = new Server(httpServer, {
      path: "/ws-vlc/",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    } );

    this.logger.log("WebSocket iniciado!");

    this.io.on(FromRemotePlayerEvent.CONNECTION, async (socket: Socket) => {
      const { token } = socket.handshake.auth;

      assertIsDefined(token);

      const remotePlayer = await this.repo.getOneBySecretToken(token);

      assertIsDefined(remotePlayer);
      const remotePlayerConnection: WithRequired<RemotePlayerConnection, "remotePlayer"> = {
        id: socket.id,
        ip: socket.handshake.address,
        remotePlayerId: remotePlayer.id,
        remotePlayer,
        isVlcInstanceOpen: false,
      };

      await this.remotePlayersService.register(remotePlayerConnection);
      await socket.join(remotePlayerRoom(remotePlayer.id));

      socket.on(FromRemotePlayerEvent.DISCONNECT, async () => {
        await this.remotePlayersService.flush(remotePlayer.id);
      } );

      socket.on(FromRemotePlayerEvent.STATUS, async (status: PlayerStatusResponse) => {
        await this.remotePlayersService.setOpen(remotePlayer.id, !!status.status);
        this.domainEventEmitter.publish(
          FromRemotePlayerEvents.Status.create(status, remotePlayer.id),
        );
      } );
    } );
  }

  async emitPlayResource(params: {message: PlayResourceMessage;
remotePlayerId: string;} ) {
    assertIsDefined(this.io);
    const { message, remotePlayerId } = params;
    const msg: PlayResourceMessage = {
      mediaElements: message.mediaElements,
      force: message.force,
    };

    this.io
      .to(remotePlayerRoom(remotePlayerId))
      .emit(ToRemotePlayerEvent.PLAY_RESOURCE, msg);
  }
}

export function remotePlayerRoom(remotePlayerId: string) {
  return `remote-player:${remotePlayerId}`;
}
