import assert from "node:assert";
import { Server as HttpServer } from "node:http";
import { PlayResourceMessage, PlayerEvent } from "#shared/models/player";
import { assertIsDefined } from "#shared/utils/validation";
import { Server, Socket } from "socket.io";
import { QUEUE_NAME, StatusPlayerEvent } from "../messaging";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Event } from "#utils/message-broker";
import { DomainMessageBroker } from "#modules/domain-message-broker";

const DepsMap = {
  domainMessageBroker: DomainMessageBroker,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class VlcBackWSService {
  #io: Server | undefined;

  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    this.#deps.domainMessageBroker.subscribe(QUEUE_NAME, (event: Event<any>) => {
      switch (event.type) {
        case PlayerEvent.PAUSE_TOGGLE:
          this.#emitPauseToggle();
          break;
        case PlayerEvent.NEXT:
          this.#emitNext();
          break;
        case PlayerEvent.PREVIOUS:
          this.#emitPrevious();
          break;
        case PlayerEvent.STOP:
          this.#emitStop();
          break;
        case PlayerEvent.SEEK:
          this.#emitSeek(event.payload.value);
          break;
        case PlayerEvent.PLAY:
          this.#emitPlay(event.payload.id);
          break;
        case PlayerEvent.FULLSCREEN_TOGGLE:
          this.#emitFullscreenToggle();
          break;
        default:
          break;
      }

      return Promise.resolve();
    } );
  }

  startSocket(httpServer: HttpServer) {
    assert(!this.#io, "Server already started");

    this.#io = new Server(httpServer, {
      path: "/ws-vlc/",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    } );

    console.log("[PLAYER-VLC] WebSocket iniciado!");

    this.#io.on(PlayerEvent.CONNECTION, (socket: Socket) => {
      console.log("[PLAYER-VLC] a user connected");

      socket.on(PlayerEvent.DISCONNECT, () => {
        console.log("[PLAYER-VLC] user disconnected");
      } );

      socket.on(PlayerEvent.STATUS, (status) => {
        this.#deps.domainMessageBroker.publish(QUEUE_NAME, new StatusPlayerEvent(status));
      } );
    } );
  }

  async #emitPauseToggle() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.PAUSE_TOGGLE);
  }

  async #emitNext() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.NEXT);
  }

  async #emitPrevious() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.PREVIOUS);
  }

  async #emitStop() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.STOP);
  }

  async #emitSeek(val: number | string) {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.SEEK, val);
  }

  async #emitFullscreenToggle() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.FULLSCREEN_TOGGLE);
  }

  async #emitPlay(id: number) {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.PLAY, id);
  }

  async emitPlayResource(params: PlayResourceMessage) {
    assertIsDefined(this.#io);
    const msg: PlayResourceMessage = {
      resources: params.resources,
      force: params.force,
    };

    this.#io.emit(PlayerEvent.PLAY_RESOURCE, msg);
  }
}
