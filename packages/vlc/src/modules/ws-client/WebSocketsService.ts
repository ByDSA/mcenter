import { io, Socket } from "socket.io-client";
import { showError } from "$shared/utils/errors/showError";
import { FromRemotePlayerEvent, PlayResourceMessage, ToRemotePlayerEvent } from "#modules/models";
import { PlayerService } from "../PlayerService";

type StartSocketParams = {
  url: string;
  secretToken: string;
};

type Params = {
  playerService: PlayerService;
};
export class WebSocketsService {
  #socket: Socket | undefined;

  #playerService: PlayerService;

  constructor( { playerService }: Params) {
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

  startSocket( { url, secretToken }: StartSocketParams): void {
    const { origin } = new URL(url);
    const path = new URL(url).pathname;

    this.#socket = io(origin, {
      path,
      auth: {
        token: secretToken,
      },
    } );

    const socket = this.#socket;

    this.#playerService.onStatusChange((status) => {
      socket.emit(FromRemotePlayerEvent.STATUS, status);
    } );

    socket.on("connect", () => {
      console.log("socket connected to backend");
    } );

    socket.on("disconnect", () => {
      console.log("socket disconnected from backend");
    } );

    socket.on(ToRemotePlayerEvent.PAUSE_TOGGLE, () => {
      console.log("pause toggle");

      this.#playerService.pauseToggle()
        .catch(showError);
    } );

    socket.on(ToRemotePlayerEvent.NEXT, () => {
      console.log("next");

      this.#playerService.next()
        .catch(showError);
    } );

    socket.on(ToRemotePlayerEvent.PREVIOUS, () => {
      console.log("previous");

      this.#playerService.previous()
        .catch(showError);
    } );

    socket.on(ToRemotePlayerEvent.STOP, () => {
      console.log("stop");

      this.#playerService.stop()
        .catch(showError);
    } );

    socket.on(ToRemotePlayerEvent.PLAY, (id: number) => {
      console.log("play", id);

      this.#playerService.play(id)
        .catch(showError);
    } );

    socket.on(ToRemotePlayerEvent.SEEK, (val: number | string) => {
      if (!(typeof val === "string" || typeof val === "number"))
        throw new Error("val is not string or number");

      console.log("seek", val);

      this.#playerService.seek(val)
        .catch(showError);
    } );

    socket.on(ToRemotePlayerEvent.PLAY_RESOURCE, (msg: PlayResourceMessage) => {
      this.#playerService.playResource(msg)
        .catch(showError);
    } );
  }
}
