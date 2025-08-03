import assert from "node:assert";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { OnEvent } from "@nestjs/event-emitter";
import { PlayerEvent as PlayerEventType, PlayerStatusResponse } from "#modules/player/player-services/models";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { PlayerEvents } from "../events";

@Injectable()
export class FrontWSServerService {
  private io: Server | undefined;

  #lastStatus: PlayerStatusResponse | undefined;

  private readonly playerLogger: Logger = new Logger("Player");

  private readonly logger: Logger = new Logger("Player-Front");

  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) {
  }

  @OnEvent(PlayerEvents.WILDCARD)
  handleEvents(event: DomainEvent<any>) {
    if (event.type === PlayerEvents.Status.TYPE) {
      this.#emitStatus(event.payload.status);
      this.#lastStatus = event.payload.status;
    } else if (event.payload === null)
      this.playerLogger.log(event.type);
    else
      this.playerLogger.log(`${event.type}: `, event.payload);
  }

  startSocket(httpServer: HttpServer) {
    assert(!this.io, "HttpServer ya definido");

    this.io = new Server(httpServer, {
      path: "/ws/",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    } );

    this.logger.log("Servidor WebSocket iniciado!");

    this.io.on(PlayerEventType.CONNECTION, (socket: Socket) => {
      this.logger.log("a user connected");

      if (this.#lastStatus)
        this.#emitLastStatus();

      socket.on(PlayerEventType.DISCONNECT, () => {
        this.logger.log("user disconnected");
      } );

      socket.on(PlayerEventType.PAUSE_TOGGLE, () => {
        this.domainEventEmitter.publish(
          PlayerEvents.Empty.create(PlayerEventType.PAUSE_TOGGLE),
        );
      } );

      socket.on(PlayerEventType.NEXT, () => {
        this.domainEventEmitter.publish(
          PlayerEvents.Empty.create(PlayerEventType.NEXT),
        );
      } );

      socket.on(PlayerEventType.PREVIOUS, () => {
        this.domainEventEmitter.publish(
          PlayerEvents.Empty.create(PlayerEventType.PREVIOUS),
        );
      } );

      socket.on(PlayerEventType.STOP, () => {
        this.domainEventEmitter.publish(
          PlayerEvents.Empty.create(PlayerEventType.STOP),
        );
      } );

      socket.on(PlayerEventType.PLAY, (id: number) => {
        this.domainEventEmitter.publish(
          PlayerEvents.Play.create(id),
        );
      } );

      socket.on(PlayerEventType.SEEK, (val: number | string) => {
        if (!(typeof val === "string" || typeof val === "number"))
          throw new Error("val is not string or number");

        this.domainEventEmitter.publish(
          PlayerEvents.Seek.create(val),
        );
      } );

      socket.on(PlayerEventType.FULLSCREEN_TOGGLE, () => {
        this.logger.log("fullscreen toggle");

        this.domainEventEmitter.publish(
          PlayerEvents.Empty.create(PlayerEventType.FULLSCREEN_TOGGLE),
        );
      } );
    } );
  }

  #emitLastStatus() {
    assertIsDefined(this.#lastStatus);
    this.#emitStatus(this.#lastStatus);
  }

  #emitStatus(status: PlayerStatusResponse) {
    assertIsDefined(this.io);

    this.io.emit(PlayerEventType.STATUS, status);
  }
}
