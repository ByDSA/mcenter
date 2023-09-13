import { getBackendUrl } from "#modules/utils";
import { RemotePlayerStatusResponse, assertIsRemotePlayerStatusResponse } from "#shared/models/player";
import { RemotePlayerWebSocketsEvents } from "#shared/models/player/remote-player";
import { Socket, io } from "socket.io-client";

export default abstract class WebSocketsClient {
  socket: Socket;

  // eslint-disable-next-line class-methods-use-this
  init() {
    const SOCKET_URL = getBackendUrl();

    console.log("connecting to", SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      path: "/ws/",
    } );

    this.socket.on(RemotePlayerWebSocketsEvents.CONNECT, () => {
      console.log("connected");
      this.socket.emit("join", "player");
    } );

    this.socket.on(RemotePlayerWebSocketsEvents.STATUS, (data: RemotePlayerStatusResponse) => {
      assertIsRemotePlayerStatusResponse(data);
      this.onStatus(data);
    } );
  }

  abstract onStatus(status: RemotePlayerStatusResponse): void;

  emitPauseToggle() {
    this.socket.emit(RemotePlayerWebSocketsEvents.PAUSE_TOGGLE, null);
  }

  emitNext() {
    this.socket.emit(RemotePlayerWebSocketsEvents.NEXT, null);
  }

  emitPrevious() {
    this.socket.emit(RemotePlayerWebSocketsEvents.PREVIOUS, null);
  }

  emitStop() {
    this.socket.emit(RemotePlayerWebSocketsEvents.STOP, null);
  }

  emitSeek(val: number | string) {
    this.socket.emit(RemotePlayerWebSocketsEvents.SEEK, val);
  }

  emitPlay(id?: number | string) {
    this.socket.emit(RemotePlayerWebSocketsEvents.PLAY, id);
  }
}