/* eslint-disable require-await */
import assert from "node:assert";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { OnEvent } from "@nestjs/event-emitter";
import { DomainEventEmitter } from "#modules/domain-event-emitter";
import { PlayerEvent, PlayResourceMessage } from "#modules/player/player-services/models";
import { DomainEvent } from "#modules/domain-event-emitter";
import { PlayerEvents } from "../events";

@Injectable()
export class VlcBackWSService {
  io: Server | undefined;

  private readonly logger = new Logger("Player-VLC");

  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(PlayerEvents.WILDCARD)
  async handleEvents(event: DomainEvent<unknown>) {
    switch (event.type) {
      case PlayerEvents.getEventEmitterType(PlayerEvent.PAUSE_TOGGLE):
        await this.#emitPauseToggle();
        break;
      case PlayerEvents.getEventEmitterType(PlayerEvent.NEXT):
        await this.#emitNext();
        break;
      case PlayerEvents.getEventEmitterType(PlayerEvent.PREVIOUS):
        await this.#emitPrevious();
        break;
      case PlayerEvents.getEventEmitterType(PlayerEvent.STOP):
        await this.#emitStop();
        break;
      case PlayerEvents.getEventEmitterType(PlayerEvent.SEEK):
        await this.#emitSeek((event as PlayerEvents.Seek.Event).payload.value);
        break;
      case PlayerEvents.getEventEmitterType(PlayerEvent.PLAY):
        await this.#emitPlay((event as PlayerEvents.Play.Event).payload.id);
        break;
      case PlayerEvents.getEventEmitterType(PlayerEvent.FULLSCREEN_TOGGLE):
        await this.#emitFullscreenToggle();
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

    this.io.on(PlayerEvent.CONNECTION, (socket: Socket) => {
      this.logger.log("a user connected");

      socket.on(PlayerEvent.DISCONNECT, () => {
        this.logger.log("user disconnected");
      } );

      socket.on(PlayerEvent.STATUS, (status) => {
        this.domainEventEmitter.publish(PlayerEvents.Status.create(status));
      } );
    } );
  }

  async #emitPauseToggle() {
    assertIsDefined(this.io);

    this.io.emit(PlayerEvent.PAUSE_TOGGLE);
  }

  async #emitNext() {
    assertIsDefined(this.io);

    this.io.emit(PlayerEvent.NEXT);
  }

  async #emitPrevious() {
    assertIsDefined(this.io);

    this.io.emit(PlayerEvent.PREVIOUS);
  }

  async #emitStop() {
    assertIsDefined(this.io);

    this.io.emit(PlayerEvent.STOP);
  }

  async #emitSeek(val: number | string) {
    assertIsDefined(this.io);

    this.io.emit(PlayerEvent.SEEK, val);
  }

  async #emitFullscreenToggle() {
    assertIsDefined(this.io);

    this.io.emit(PlayerEvent.FULLSCREEN_TOGGLE);
  }

  async #emitPlay(id: number) {
    assertIsDefined(this.io);

    this.io.emit(PlayerEvent.PLAY, id);
  }

  async emitPlayResource(params: PlayResourceMessage) {
    assertIsDefined(this.io);
    const msg: PlayResourceMessage = {
      mediaElements: params.mediaElements,
      force: params.force,
    };

    this.io.emit(PlayerEvent.PLAY_RESOURCE, msg);
  }
}
