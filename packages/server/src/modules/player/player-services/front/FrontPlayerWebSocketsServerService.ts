import assert from "node:assert";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { showError } from "$shared/utils/errors/showError";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { PlayerEvent as PlayerEventType, PlayerStatusResponse } from "#modules/player/player-services/models";
import { BrokerEvent } from "#utils/message-broker";
import { EmptyPlayerEvent, PlayPlayerEvent, QUEUE_NAME, SeekPlayerEvent } from "../messaging";

@Injectable()
export class FrontWSServerService {
  private io: Server | undefined;

  #lastStatus: PlayerStatusResponse | undefined;

  constructor(private readonly domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(QUEUE_NAME, (event: BrokerEvent<any>) => {
      if (event.type === PlayerEventType.STATUS) {
        this.#emitStatus(event.payload.status);
        this.#lastStatus = event.payload.status;
      } else if (event instanceof EmptyPlayerEvent)
        console.log("[PLAYER]", event.type);
      else
        console.log("[PLAYER]", `${event.type}: `, event.payload);

      return Promise.resolve();
    } ).catch(showError);
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

    console.log("[PLAYER-FRONT] Servidor WebSocket iniciado!");

    this.io.on(PlayerEventType.CONNECTION, (socket: Socket) => {
      console.log("[PLAYER-FRONT] a user connected");

      if (this.#lastStatus)
        this.#emitLastStatus();

      socket.on(PlayerEventType.DISCONNECT, () => {
        console.log("[PLAYER-FRONT] user disconnected");
      } );

      socket.on(PlayerEventType.PAUSE_TOGGLE, () => {
        this.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.PAUSE_TOGGLE),
        ).catch(showError);
      } );

      socket.on(PlayerEventType.NEXT, () => {
        this.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.NEXT),
        ).catch(showError);
      } );

      socket.on(PlayerEventType.PREVIOUS, () => {
        this.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.PREVIOUS),
        ).catch(showError);
      } );

      socket.on(PlayerEventType.STOP, () => {
        this.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.STOP),
        ).catch(showError);
      } );

      socket.on(PlayerEventType.PLAY, (id: number) => {
        this.domainMessageBroker.publish(
          QUEUE_NAME,
          new PlayPlayerEvent(id),
        ).catch(showError);
      } );

      socket.on(PlayerEventType.SEEK, (val: number | string) => {
        if (!(typeof val === "string" || typeof val === "number"))
          throw new Error("val is not string or number");

        this.domainMessageBroker.publish(
          QUEUE_NAME,
          new SeekPlayerEvent(val),
        ).catch(showError);
      } );

      socket.on(PlayerEventType.FULLSCREEN_TOGGLE, () => {
        console.log("[FRONT] fullscreen toggle");

        this.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.FULLSCREEN_TOGGLE),
        ).catch(showError);
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
