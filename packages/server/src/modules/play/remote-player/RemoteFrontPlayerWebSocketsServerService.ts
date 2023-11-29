import { PlayerActionsReceiver, PlayerEvent, PlayerStatusResponse } from "#shared/models/player";
import { assertIsDefined } from "#shared/utils/validation";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { VlcBackWebSocketsServerService } from "./vlc-back-service";

type Params = {
  vlcBackService: VlcBackWebSocketsServerService;
  getHttpServer: ()=> HttpServer;
};
export default class WebSocketsFrontServerService implements PlayerActionsReceiver {
  #io: Server | undefined;

  #vlcBackService: VlcBackWebSocketsServerService;

  #getHttpServer: ()=> HttpServer;

  constructor( {getHttpServer, vlcBackService}: Params) {
    this.#getHttpServer = getHttpServer;
    this.#vlcBackService = vlcBackService;

    setTimeout(() => {
      this.startSocket();
      this.#vlcBackService.startSocket( {
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

    if (!this.#getHttpServer()) {
      setTimeout(this.startSocket.bind(this), 100);

      return;
    }

    this.#io = new Server(this.#getHttpServer(), {
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