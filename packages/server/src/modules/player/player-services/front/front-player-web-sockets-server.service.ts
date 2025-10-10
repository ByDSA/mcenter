import assert from "node:assert";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { ForbiddenException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { OnEvent } from "@nestjs/event-emitter";
import { ToRemotePlayerEvent, FromRemotePlayerEvent, PlayerStatusResponse } from "#modules/player/player-services/models";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { AppPayloadEncoderService } from "#core/auth/strategies/jwt/payload/AppPayloadEncoderService";
import { ToRemotePlayerEvents, FromRemotePlayerEvents } from "../events";
import { RemotePlayersRepository } from "../repository";
import { remotePlayerRoom } from "../vlc-back/vlc-back-ws-server.service";

@Injectable()
export class FrontWSServerService {
  private io: Server | undefined;

  #lastStatusMap: Record<string, PlayerStatusResponse> = {};

  private readonly playerLogger: Logger = new Logger("Player");

  private readonly logger: Logger = new Logger("Player-Front");

  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    private readonly remotePlayerRepo: RemotePlayersRepository,
    private readonly jwtEncoder: AppPayloadEncoderService,
  ) {
  }

  @OnEvent(ToRemotePlayerEvents.WILDCARD)
  handleToRemotePlayerEvents(event: DomainEvent<any>) {
    if (event.payload === null)
      this.playerLogger.log(event.type);
    else
      this.playerLogger.log(`${event.type}: ${event.payload}`);
  }

  @OnEvent(FromRemotePlayerEvents.WILDCARD)
  handleFromRemotePlayerEvents(event: DomainEvent<any>) {
    assertIsDefined(this.io);

    if (event.type === FromRemotePlayerEvents.Status.TYPE) {
      const parsedEvent = event as FromRemotePlayerEvents.Status.Event;
      const { remotePlayerId } = parsedEvent.payload;

      this.#emitStatus(parsedEvent.payload.status, remotePlayerId);
      this.#lastStatusMap[remotePlayerId] = event.payload.status;
    } else if (event.type === FromRemotePlayerEvents.Connection.TYPE) {
      const parsedEvent = event as FromRemotePlayerEvents.Connection.Event;

      this.io
        .to(remotePlayerRoom(parsedEvent.payload.remotePlayer.id))
        .emit(FromRemotePlayerEvent.CONNECTION, event.payload);
    } else if (event.type === FromRemotePlayerEvents.OpenClosed.TYPE) {
      const parsedEvent = event as FromRemotePlayerEvents.OpenClosed.Event;

      this.io
        .to(remotePlayerRoom(parsedEvent.payload.remotePlayerId))
        .emit(FromRemotePlayerEvent.OPEN_CLOSED, event.payload);
    } else
      this.playerLogger.log(`${event.type}: ${event.payload}`);
  }

  startSocket(httpServer: HttpServer) {
    assert(!this.io, "HttpServer ya definido");

    this.io = new Server(httpServer, {
      path: "/ws/",
      cors: {
        origin: process.env.FRONTEND_URL ?? "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    } );

    this.io.use(async (socket: Socket, next) => {
      try {
        const guardRet = await this.guardAuth(socket);

        // Guardar en socket.data para usarlo después
        socket.data.guardRet = guardRet;
        next(); // Permitir conexión
      } catch (e) {
        if (e instanceof Error) {
          this.logger.warn(e.message);
          // Rechazar la conexión - esto dispara 'connect_error' en el cliente
          next(new Error(e.message));
        }
      }
    } );

    this.logger.log("Servidor WebSocket iniciado!");

    this.io.on(ToRemotePlayerEvent.CONNECTION, async (socket: Socket) => {
      const { guardRet } = socket.data;
      const { remotePlayerId } = guardRet as Awaited<ReturnType<typeof this.guardAuth>>;

      await socket.join(remotePlayerRoom(remotePlayerId));

      if (this.#lastStatusMap[remotePlayerId])
        this.#emitLastStatus(remotePlayerId);

      socket.on(ToRemotePlayerEvent.DISCONNECT, () => {
        this.logger.log("user disconnected");
      } );

      socket.on(ToRemotePlayerEvent.PAUSE_TOGGLE, () => {
        this.domainEventEmitter.publish(
          ToRemotePlayerEvents.Empty.create(ToRemotePlayerEvent.PAUSE_TOGGLE, remotePlayerId),
        );
      } );

      socket.on(ToRemotePlayerEvent.NEXT, () => {
        this.domainEventEmitter.publish(
          ToRemotePlayerEvents.Empty.create(ToRemotePlayerEvent.NEXT, remotePlayerId),
        );
      } );

      socket.on(ToRemotePlayerEvent.PREVIOUS, () => {
        this.domainEventEmitter.publish(
          ToRemotePlayerEvents.Empty.create(ToRemotePlayerEvent.PREVIOUS, remotePlayerId),
        );
      } );

      socket.on(ToRemotePlayerEvent.STOP, () => {
        this.domainEventEmitter.publish(
          ToRemotePlayerEvents.Empty.create(ToRemotePlayerEvent.STOP, remotePlayerId),
        );
      } );

      socket.on(ToRemotePlayerEvent.PLAY, (id: number) => {
        this.domainEventEmitter.publish(
          ToRemotePlayerEvents.Play.create(id, remotePlayerId),
        );
      } );

      socket.on(ToRemotePlayerEvent.SEEK, (val: number | string) => {
        if (!(typeof val === "string" || typeof val === "number"))
          throw new Error("val is not string or number");

        this.domainEventEmitter.publish(
          ToRemotePlayerEvents.Seek.create(val, remotePlayerId),
        );
      } );

      socket.on(ToRemotePlayerEvent.FULLSCREEN_TOGGLE, () => {
        this.logger.log("fullscreen toggle");

        this.domainEventEmitter.publish(
          ToRemotePlayerEvents.Empty.create(ToRemotePlayerEvent.FULLSCREEN_TOGGLE, remotePlayerId),
        );
      } );
    } );
  }

  #emitLastStatus(remotePlayerId: string) {
    assertIsDefined(this.#lastStatusMap[remotePlayerId]);
    this.#emitStatus(this.#lastStatusMap[remotePlayerId], remotePlayerId);
  }

  #emitStatus(status: PlayerStatusResponse, remotePlayerId: string) {
    assertIsDefined(this.io);

    this.io
      .to(remotePlayerRoom(remotePlayerId))
      .emit(FromRemotePlayerEvent.STATUS, status);
  }

  private async guardAuth(socket: Socket) {
    const remotePlayerId = socket.handshake.query.id;

    assert(typeof remotePlayerId === "string");
    const { cookie } = socket.handshake.headers;

    if (!cookie)
      throw new UnauthorizedException("No cookie");

    const authCookie = cookie.split(";").find((c) => c.trim().startsWith("auth="));

    if (!authCookie)
      throw new UnauthorizedException("No auth cookie");

    const jwtToken = authCookie.split("=")[1];

    if (!jwtToken)
      throw new UnauthorizedException("No jwt token");

    try {
      const payload = this.jwtEncoder.decode(jwtToken);
      const userId = payload?.user?.id;

      assertIsDefined(userId);

      const visible = await this.remotePlayerRepo.canView( {
        userId,
        remotePlayerId,
      } );

      assert(visible);
      this.logger.log("user " + userId + " connected to " + remotePlayerId);

      return {
        userId,
        remotePlayerId,
      };
    } catch {
      throw new ForbiddenException();
    }
  }
}
