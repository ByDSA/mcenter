import ExpressApp from "#main/ExpressApp";
import { PlayResourceMessage, PlayerActions, PlayerEvent, PlayerStatusResponse } from "#shared/models/player";
import { assertIsDefined } from "#shared/utils/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Server, Socket } from "socket.io";
import RemoteFrontPlayerWebSocketsServerService from "../RemoteFrontPlayerWebSocketsServerService";

type StartSocketParams = {
  remoteFrontPlayerWebSocketsServerService: RemoteFrontPlayerWebSocketsServerService;
};
const DepsMap = {
  app: ExpressApp,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class WSService implements PlayerActions {
  #io: Server | undefined;

  #lastStatus: PlayerStatusResponse | undefined;

  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    // setTimeout(this.startSocket.bind(this), 0); // Porque sino intenta acceder síncronamente a 'app.httpServer' antes de que se haya creado
  }

  startSocket( {remoteFrontPlayerWebSocketsServerService}: StartSocketParams) {
    if (this.#io)
      return;

    if (!this.#deps.app.getHttpServer()) {
      setTimeout(() => this.startSocket( {
        remoteFrontPlayerWebSocketsServerService,
      } ), 100);

      return;
    }

    this.#io = new Server(this.#deps.app.getHttpServer(), {
      path: "/ws-vlc/",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    } );

    console.log("[VLC Back] WebSocket iniciado!");

    this.#io.on(PlayerEvent.CONNECTION, (socket: Socket) => {
      console.log("[VLC Back] a user connected");

      socket.on(PlayerEvent.DISCONNECT, () => {
        console.log("[VLC Back] user disconnected");
      } );

      socket.on(PlayerEvent.STATUS, (status) => {
        remoteFrontPlayerWebSocketsServerService.emitStatus(status);

        this.#lastStatus = status;
      } );
    } );
  }

  getLastStatus() {
    return this.#lastStatus;
  }

  async pauseToggle() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.PAUSE_TOGGLE);
  }

  async next() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.NEXT);
  }

  async previous() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.PREVIOUS);
  }

  async stop() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.STOP);
  }

  async seek(val: number | string) {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.SEEK, val);
  }

  async fullscreenToggle() {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.FULLSCREEN_TOGGLE);
  }

  async play(id: number) {
    assertIsDefined(this.#io);

    this.#io.emit(PlayerEvent.PLAY, id);
  }

  async playResource(params: PlayResourceMessage) {
    assertIsDefined(this.#io);
    const msg: PlayResourceMessage = {
      resources: params.resources,
      force: params.force,
    };

    this.#io.emit(PlayerEvent.PLAY_RESOURCE, msg);
  }
}