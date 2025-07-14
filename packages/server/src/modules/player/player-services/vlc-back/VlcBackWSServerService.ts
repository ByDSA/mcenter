/* eslint-disable require-await */
import assert from "node:assert";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { showError } from "$shared/utils/errors/showError";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { PlayerEvent, PlayResourceMessage } from "#modules/player/player-services/models";
import { BrokerEvent } from "#utils/message-broker";
import { QUEUE_NAME, StatusPlayerEvent } from "../messaging";

@Injectable()
export class VlcBackWSService {
  io: Server | undefined;

  constructor(private domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(QUEUE_NAME, async (event: BrokerEvent<any>) => {
      switch (event.type) {
        case PlayerEvent.PAUSE_TOGGLE:
          await this.#emitPauseToggle();
          break;
        case PlayerEvent.NEXT:
          await this.#emitNext();
          break;
        case PlayerEvent.PREVIOUS:
          await this.#emitPrevious();
          break;
        case PlayerEvent.STOP:
          await this.#emitStop();
          break;
        case PlayerEvent.SEEK:
          await this.#emitSeek(event.payload.value);
          break;
        case PlayerEvent.PLAY:
          await this.#emitPlay(event.payload.id);
          break;
        case PlayerEvent.FULLSCREEN_TOGGLE:
          await this.#emitFullscreenToggle();
          break;
        default:
          break;
      }

      return Promise.resolve();
    } ).catch(showError);
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

    console.log("[PLAYER-VLC] WebSocket iniciado!");

    this.io.on(PlayerEvent.CONNECTION, (socket: Socket) => {
      console.log("[PLAYER-VLC] a user connected");

      socket.on(PlayerEvent.DISCONNECT, () => {
        console.log("[PLAYER-VLC] user disconnected");
      } );

      socket.on(PlayerEvent.STATUS, (status) => {
        this.domainMessageBroker
          .publish(QUEUE_NAME, new StatusPlayerEvent(status))
          .catch(showError);
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
      resources: params.resources,
      force: params.force,
    };

    this.io.emit(PlayerEvent.PLAY_RESOURCE, msg);
  }
}
