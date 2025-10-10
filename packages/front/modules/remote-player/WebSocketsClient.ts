/* eslint-disable require-await */
import { Socket, io } from "socket.io-client";
import { ToRemotePlayerEvent, FromRemotePlayerEvent, PlayerStatusResponse, playerStatusResponseSchema } from "$shared/models/player";
import { assertZod } from "$shared/utils/validation/zod";
import { PlayResourceParams, PlayerActions } from "$shared/models/player";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";

const SOCKET_HOST = backendUrl("");
const SOCKET_PATH = "/ws/";

type Props = {
  remotePlayerId: string;
};
export abstract class RemotePlayerWebSocketsClient implements PlayerActions {
  socket: Socket;

  init( { remotePlayerId }: Props) {
    logger.debug(`connecting to ${SOCKET_HOST}`);
    this.socket = io(SOCKET_HOST, {
      path: SOCKET_PATH,
      query: {
        id: remotePlayerId,
      },
      withCredentials: true,
    } );

    this.socket.on("connect", () => {
      this.onBackendConnect();
    } );

    this.socket.on(ToRemotePlayerEvent.DISCONNECT, () => {
      this.onDisonnect();
    } );

    this.socket.on(FromRemotePlayerEvent.STATUS, (data: PlayerStatusResponse) => {
      assertZod(playerStatusResponseSchema, data);
      this.onStatus(data);
    } );

    this.socket.on("connect_error", () => {
      this.onConnectError();
    } );
  }

  abstract onBackendConnect(): void;

  abstract onDisonnect(): void;

  abstract onConnectError(): void;

  abstract onStatus(status: PlayerStatusResponse): void;

  close() {
    this.socket.disconnect();
  }

  playResource(_: PlayResourceParams): Promise<void> {
    throw new Error("Method not implemented.");
  }

  fullscreenToggle(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async pauseToggle() {
    this.socket.emit(ToRemotePlayerEvent.PAUSE_TOGGLE, null);
  }

  async next() {
    this.socket.emit(ToRemotePlayerEvent.NEXT, null);
  }

  async previous() {
    this.socket.emit(ToRemotePlayerEvent.PREVIOUS, null);
  }

  async stop() {
    this.socket.emit(ToRemotePlayerEvent.STOP, null);
  }

  async seek(val: number | string) {
    this.socket.emit(ToRemotePlayerEvent.SEEK, val);
  }

  async play(id?: number | string) {
    this.socket.emit(ToRemotePlayerEvent.PLAY, id);
  }
}
