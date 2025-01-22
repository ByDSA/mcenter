import assert from "node:assert";
import { Server as HttpServer } from "node:http";
import { PlayerEvent as PlayerEventType, PlayerStatusResponse } from "#shared/models/player";
import { assertIsDefined } from "#shared/utils/validation";
import { Server, Socket } from "socket.io";
import { EmptyPlayerEvent, PlayPlayerEvent, QUEUE_NAME, SeekPlayerEvent } from "../messaging";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Event } from "#utils/message-broker";
import { DomainMessageBroker } from "#modules/domain-message-broker";

const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class FrontWSServerService {
  #io: Server | undefined;

  #deps: Deps;

  #lastStatus: PlayerStatusResponse | undefined;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(QUEUE_NAME, (event: Event<any>) => {
      if (event.type === PlayerEventType.STATUS) {
        this.#emitStatus(event.payload.status);
        this.#lastStatus = event.payload.status;
      } else if (event instanceof EmptyPlayerEvent)
        console.log("[PLAYER]", event.type);
      else
        console.log("[PLAYER]", `${event.type}: `, event.payload);

      return Promise.resolve();
    } );
  }

  startSocket(httpServer: HttpServer) {
    assert(!this.#io, "HttpServer ya definido");

    this.#io = new Server(httpServer, {
      path: "/ws/",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    } );

    console.log("[PLAYER-FRONT] Servidor WebSocket iniciado!");

    this.#io.on(PlayerEventType.CONNECTION, (socket: Socket) => {
      console.log("[PLAYER-FRONT] a user connected");

      if (this.#lastStatus)
        this.#emitLastStatus();

      socket.on(PlayerEventType.DISCONNECT, () => {
        console.log("[PLAYER-FRONT] user disconnected");
      } );

      socket.on(PlayerEventType.PAUSE_TOGGLE, () => {
        this.#deps.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.PAUSE_TOGGLE),
        );
      } );

      socket.on(PlayerEventType.NEXT, () => {
        this.#deps.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.NEXT),
        );
      } );

      socket.on(PlayerEventType.PREVIOUS, () => {
        this.#deps.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.PREVIOUS),
        );
      } );

      socket.on(PlayerEventType.STOP, () => {
        this.#deps.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.STOP),
        );
      } );

      socket.on(PlayerEventType.PLAY, (id: number) => {
        this.#deps.domainMessageBroker.publish(
          QUEUE_NAME,
          new PlayPlayerEvent(id),
        );
      } );

      socket.on(PlayerEventType.SEEK, (val: number | string) => {
        if (!(typeof val === "string" || typeof val === "number"))
          throw new Error("val is not string or number");

        this.#deps.domainMessageBroker.publish(
          QUEUE_NAME,
          new SeekPlayerEvent(val),
        );
      } );

      socket.on(PlayerEventType.FULLSCREEN_TOGGLE, () => {
        console.log("[FRONT] fullscreen toggle");

        this.#deps.domainMessageBroker.publish(
          QUEUE_NAME,
          new EmptyPlayerEvent(PlayerEventType.FULLSCREEN_TOGGLE),
        );
      } );
    } );
  }

  #emitLastStatus() {
    assertIsDefined(this.#lastStatus);
    this.#emitStatus(this.#lastStatus);
  }

  #emitStatus(status: PlayerStatusResponse) {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEventType.STATUS, status);
  }
}
