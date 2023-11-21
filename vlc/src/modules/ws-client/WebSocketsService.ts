import { PlayerEvent, PlayResourceMessage } from "#shared/models/player";
import { io, Socket } from "socket.io-client";
import PlayerService from "../PlayerService";

type StartSocketParams = {
  host: string;
  port: number;
  path: string;
};

type Params = {
  playerService: PlayerService;
};
export default class WebSocketsService {
  #socket: Socket | undefined;

  #playerService: PlayerService;

  constructor( {playerService}: Params) {
    this.#playerService = playerService;
  }

  stopSocket() {
    if (!this.#socket)
      throw new Error("socket is not defined");

    this.#socket.close();
  }

  // Para testing
  private getSocket() {
    return this.#socket;
  }

  async startSocket( {host,path,port}: StartSocketParams): Promise<void> {
    this.#socket = io(`http://${host}:${port}`, {
      path,
    } );

    const socket = this.#socket;

    this.#playerService.onStatusChange((status) => {
      socket.emit(PlayerEvent.STATUS, status);
    } );

    socket.on(PlayerEvent.CONNECT, () => {
      console.log("socket connected");
    },
    );

    socket.on(PlayerEvent.DISCONNECT, () => {
      console.log("socket disconnected");
    },
    );

    socket.on(PlayerEvent.PAUSE_TOGGLE, () => {
      console.log("pause toggle");

      this.#playerService.pauseToggle();
    } );

    socket.on(PlayerEvent.NEXT, () => {
      console.log("next");

      this.#playerService.next();
    } );

    socket.on(PlayerEvent.PREVIOUS, () => {
      console.log("previous");

      this.#playerService.previous();
    } );

    socket.on(PlayerEvent.STOP, () => {
      console.log("stop");

      this.#playerService.stop();
    } );

    socket.on(PlayerEvent.PLAY, (id: number) => {
      console.log("play", id);

      this.#playerService.play(id);
    } );

    socket.on(PlayerEvent.SEEK, (val: number | string) => {
      if (!(typeof val === "string" || typeof val === "number"))
        throw new Error("val is not string or number");

      console.log("seek", val);

      this.#playerService.seek(val);
    } );

    socket.on(PlayerEvent.PLAY_RESOURCE, (msg: PlayResourceMessage) => {
      this.#playerService.playResource(msg);
    } );

    await new Promise<void>((resolve) => {
      socket.on("connect", () => {
        console.log("connected");

        resolve();
      } );
    } );
  }
}