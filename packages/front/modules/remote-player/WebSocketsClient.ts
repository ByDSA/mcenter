/* eslint-disable require-await */
import { Socket, io } from "socket.io-client";
import { PlayerEvent, PlayerStatusResponse, assertIsPlayerStatusResponse } from "$shared/models/player";
import { PlayResourceParams, PlayerActions } from "$shared/models/player/Player";
import { backendUrl } from "#modules/requests";

export const socketUrl = {
  url: backendUrl(""),
  path: "/ws/",
};

export abstract class RemotePlayerWebSocketsClient implements PlayerActions {
  socket: Socket;

  init() {
    const SOCKET_URL = socketUrl.url;

    console.log("connecting to", SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      path: socketUrl.path,
    } );

    this.socket.on(PlayerEvent.CONNECT, () => {
      console.log("connected");
      this.socket.emit("join", "player");
    } );

    this.socket.on(PlayerEvent.STATUS, (data: PlayerStatusResponse) => {
      assertIsPlayerStatusResponse(data);
      this.onStatus(data);
    } );
  }

  abstract onStatus(status: PlayerStatusResponse): void;

  playResource(_: PlayResourceParams): Promise<void> {
    throw new Error("Method not implemented.");
  }

  fullscreenToggle(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async pauseToggle() {
    this.socket.emit(PlayerEvent.PAUSE_TOGGLE, null);
  }

  async next() {
    this.socket.emit(PlayerEvent.NEXT, null);
  }

  async previous() {
    this.socket.emit(PlayerEvent.PREVIOUS, null);
  }

  async stop() {
    this.socket.emit(PlayerEvent.STOP, null);
  }

  async seek(val: number | string) {
    this.socket.emit(PlayerEvent.SEEK, val);
  }

  async play(id?: number | string) {
    this.socket.emit(PlayerEvent.PLAY, id);
  }
}
