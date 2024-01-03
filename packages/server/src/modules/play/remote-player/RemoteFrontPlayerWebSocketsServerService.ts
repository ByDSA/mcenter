import ExpressApp from "#main/ExpressApp";
import { PlayerActionsReceiver, PlayerEvent, PlayerStatusResponse } from "#shared/models/player";
import { assertIsDefined } from "#shared/utils/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Server, Socket } from "socket.io";
import { VlcBackWebSocketsServerService } from "./vlc-back-service";

const DepsMap = {
  vlcBackService: VlcBackWebSocketsServerService,
  app: ExpressApp,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class WebSocketsFrontServerService implements PlayerActionsReceiver {
  #io: Server | undefined;

  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;

    setTimeout(() => {
      this.startSocket();
      this.#deps.vlcBackService.startSocket( {
        remoteFrontPlayerWebSocketsServerService: this,
      } );
    }, 0); // Porque sino intenta acceder síncronamente a 'app.httpServer' antes de que se haya creado
  }

  onFullscreenToggle(): void {
    throw new Error("Method not implemented.");
  }

  startSocket() {
    if (this.#io)
      return;

    if (!this.#deps.app.getHttpServer()) {
      setTimeout(this.startSocket.bind(this), 100);

      return;
    }

    this.#io = new Server(this.#deps.app.getHttpServer(), {
      path: "/ws/",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    } );

    console.log("Servidor WebSocket iniciado!");

    this.#io.on(PlayerEvent.CONNECTION, (socket: Socket) => {
      console.log("[FRONT] a user connected");

      this.#sendLastStatus();

      socket.on(PlayerEvent.DISCONNECT, () => {
        console.log("[FRONT] user disconnected");
      } );

      socket.on(PlayerEvent.PAUSE_TOGGLE, () => {
        console.log("[FRONT] pause toggle");
        this.onPauseToggle();
      } );

      socket.on(PlayerEvent.NEXT, () => {
        console.log("[FRONT] next");
        this.onNext();
      } );

      socket.on(PlayerEvent.PREVIOUS, () => {
        console.log("[FRONT] previous");
        this.onPrevious();
      } );

      socket.on(PlayerEvent.STOP, () => {
        console.log("[FRONT] stop");
        this.onStop();
      } );

      socket.on(PlayerEvent.PLAY, (id: number) => {
        console.log("[FRONT] play", id);
        this.onPlay(id);
      } );

      socket.on(PlayerEvent.SEEK, (val: number | string) => {
        if (!(typeof val === "string" || typeof val === "number"))
          throw new Error("val is not string or number");

        console.log("[FRONT] seek", val);
        this.onSeek(val);
      } );

      socket.on(PlayerEvent.FULLSCREEN_TOGGLE, () => {
        console.log("[FRONT] fullscreen toggle");
        this.onFullscreenToggle();
      } );
    } );
  }

  #sendLastStatus() {
    const lastStatus = this.#deps.vlcBackService.getLastStatus();

    if (lastStatus) {
      console.log("[FRONT] sending last status");
      this.emitStatus(lastStatus);
    }
  }

  emitStatus(status: PlayerStatusResponse) {
    assertIsDefined(this.#io);
    this.#io.emit(PlayerEvent.STATUS, status);
  }

  async onPauseToggle() {
    await this.#deps.vlcBackService.pauseToggle();
  }

  async onNext() {
    await this.#deps.vlcBackService.next();
  }

  async onPrevious() {
    await this.#deps.vlcBackService.previous();
  }

  async onStop() {
    await this.#deps.vlcBackService.stop();
  }

  async onSeek(val: number | string) {
    await this.#deps.vlcBackService.seek(val);
  }

  async onPlay(id: number) {
    await this.#deps.vlcBackService.play(id);
  }
}