import { PlayerActionsReceiver, PlayerEvent, PlayerStatusResponse } from "#shared/models/player";
import { assertIsDefined } from "#shared/utils/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { VlcBackWebSocketsServerService } from "./vlc-back-service";

const DepsMap = {
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class WebSocketsFrontServerService implements PlayerActionsReceiver {
  #io: Server | undefined;

  #deps: Deps;

  #httpServer: HttpServer | undefined;

  #vlcBackService!: VlcBackWebSocketsServerService;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  setVlcBackService(vlcBackService: VlcBackWebSocketsServerService) {
    this.#vlcBackService = vlcBackService;
  }

  onFullscreenToggle(): void {
    throw new Error("Method not implemented.");
  }

  setHttpServer(httpServer: HttpServer): void {
    this.#httpServer = httpServer;

    assertIsDefined(this.#vlcBackService);
    this.#startSocket();
  }

  #startSocket() {
    if (this.#io)
      return;

    this.#io = new Server(this.#httpServer, {
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
    const lastStatus = this.#vlcBackService.getLastStatus();

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
    await this.#vlcBackService.pauseToggle();
  }

  async onNext() {
    await this.#vlcBackService.next();
  }

  async onPrevious() {
    await this.#vlcBackService.previous();
  }

  async onStop() {
    await this.#vlcBackService.stop();
  }

  async onSeek(val: number | string) {
    await this.#vlcBackService.seek(val);
  }

  async onPlay(id: number) {
    await this.#vlcBackService.play(id);
  }
}