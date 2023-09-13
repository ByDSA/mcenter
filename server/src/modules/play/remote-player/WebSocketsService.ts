import { RemotePlayerStatusResponse, RemotePlayerWebSocketsEvents } from "#shared/models/player/remote-player";
import { WebSocketsEvents } from "#shared/models/player/remote-player/web-sockets";
import { assertIsDefined, isDefined } from "#shared/utils/validation";
import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { Service } from "./service";

type Params = {
  remotePlayerService: Service;
  getHttpServer: ()=> HttpServer;
};
export default class WebSocketsService {
  #io: Server | undefined;

  #remotePlayerService: Service;

  #getHttpServer: ()=> HttpServer;

  #status: RemotePlayerStatusResponse | undefined;

  constructor( {getHttpServer, remotePlayerService}: Params) {
    this.#getHttpServer = getHttpServer;
    this.#remotePlayerService = remotePlayerService;

    setTimeout(this.startSocket.bind(this), 0); // Porque sino intenta acceder síncronamente a 'app.httpServer' antes de que se haya creado
  }

  startSocket() {
    if (!this.#getHttpServer()) {
      setTimeout(this.startSocket.bind(this), 100);

      return;
    }

    if (!this.#io) {
      this.#io = new Server(this.#getHttpServer(), {
        path: "/ws/",
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      } );

      console.log("Servidor WebSocker iniciado!");

      this.#io.on(RemotePlayerWebSocketsEvents.CONNECTION, (socket: Socket) => {
        console.log("a user connected");

        socket.on(RemotePlayerWebSocketsEvents.DISCONNECT, () => {
          console.log("user disconnected");
        } );

        socket.on(RemotePlayerWebSocketsEvents.PAUSE_TOGGLE, () => {
          console.log("pause toggle");
          this.onPauseToggle();
        } );

        socket.on(RemotePlayerWebSocketsEvents.NEXT, () => {
          console.log("next");
          this.onNext();
        } );

        socket.on(RemotePlayerWebSocketsEvents.PREVIOUS, () => {
          console.log("previous");
          this.onPrevious();
        } );

        socket.on(RemotePlayerWebSocketsEvents.STOP, () => {
          console.log("stop");
          this.onStop();
        } );

        socket.on(RemotePlayerWebSocketsEvents.PLAY, (id: number) => {
          console.log("play", id);
          this.onPlay(id);
        } );

        socket.on(RemotePlayerWebSocketsEvents.SEEK, (val: number | string) => {
          if (!(typeof val === "string" || typeof val === "number"))
            throw new Error("val is not string or number");

          console.log("seek", val);
          this.onSeek(val);
        } );
      } );

      setInterval(async () => {
        this.#status = await this.#remotePlayerService.getStatusOrFail();
      } , 500);

      setInterval(() => {
        if (!isDefined(this.#status))
          return;

        this.emitStatus(this.#status);
      }
      , 100);
    }
  }

  emitStatus(status: RemotePlayerStatusResponse) {
    assertIsDefined(this.#io);
    this.#io.emit(WebSocketsEvents.STATUS, status);
  }

  async onPauseToggle() {
    const res = await this.#remotePlayerService.pauseToggle();

    if (this.#status?.status?.state && res)
      this.#status.status.state = res.state;

    if (isDefined(this.#status))
      this.emitStatus(this.#status);
  }

  async onNext() {
    await this.#remotePlayerService.next();
  }

  async onPrevious() {
    await this.#remotePlayerService.previous();
  }

  async onStop() {
    await this.#remotePlayerService.stop();
  }

  async onSeek(val: number | string) {
    const ret = await this.#remotePlayerService.seek(val);

    if (!ret)
      return;

    const {time: newTime} = ret;

    if (this.#status?.status?.time)
      this.#status.status.time = newTime;

    if (isDefined(this.#status))
      this.emitStatus(this.#status);
  }

  async onPlay(id: number) {
    await this.#remotePlayerService.playOrFail(id);
  }
}