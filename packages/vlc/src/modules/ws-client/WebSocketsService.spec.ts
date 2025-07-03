/* eslint-disable require-await */
/* eslint-disable jest/no-done-callback */
import { Socket } from "socket.io-client";
import { PlayerEvent } from "#modules/models";
import { PlayerServiceMock } from "#modules/player-service/tests/PlayerServiceMock";
import { PlayerService } from "#modules/PlayerService";
import { WebSocketsService } from "./WebSocketsService";
import { FakeWsServer } from "./tests/FakeWsServer";

let client: WebSocketsService;
let server: FakeWsServer;
let playerService: PlayerService;

beforeAll(async () => {
  playerService = new PlayerServiceMock();
  server = new FakeWsServer();
  await server.start();
  client = new WebSocketsService( {
    playerService,
  } );
  const port = server.getPort();

  if (!port)
    throw new Error("port is not defined");

  await client.startSocket( {
    host: server.getHost(),
    port,
    path: server.getPath(),
  } );
} );

beforeEach(() => {
  jest.clearAllMocks();
} );

afterAll(() => {
  client.stopSocket();
  server.close();
} );

describe("server emissions", () => {
  it("pause toggle", (done) => {
    playerService.pauseToggle = jest.fn(async () => {
      expect(playerService.pauseToggle).toHaveBeenCalledTimes(1);

      done();
    } );
    server.emit(PlayerEvent.PAUSE_TOGGLE, undefined);
  } );

  it("next", (done) => {
    playerService.next = jest.fn(async () => {
      expect(playerService.next).toHaveBeenCalledTimes(1);

      done();
    } );
    server.emit(PlayerEvent.NEXT, undefined);
  } );

  it("previous", (done) => {
    playerService.previous = jest.fn(async () => {
      expect(playerService.previous).toHaveBeenCalledTimes(1);

      done();
    } );
    server.emit(PlayerEvent.PREVIOUS, undefined);
  } );

  it("stop", (done) => {
    playerService.stop = jest.fn(async () => {
      expect(playerService.stop).toHaveBeenCalledTimes(1);

      done();
    } );
    server.emit(PlayerEvent.STOP, undefined);
  } );

  it("play", (done) => {
    const sendingId = 1;

    playerService.play = jest.fn(async (id) => {
      expect(playerService.play).toHaveBeenCalledTimes(1);
      expect(id).toBe(sendingId);

      done();
    } );
    server.emit(PlayerEvent.PLAY, sendingId);
  } );

  it("seek (valid string)", (done) => {
    const sendingData = "+5";

    playerService.seek = jest.fn(async (data) => {
      expect(playerService.seek).toHaveBeenCalledTimes(1);
      expect(data).toBe(sendingData);

      done();
    } );
    server.emit(PlayerEvent.SEEK, sendingData);
  } );

  it("seek (valid number)", (done) => {
    const sendingData = 1;

    playerService.seek = jest.fn(async (d) => {
      expect(playerService.seek).toHaveBeenCalledTimes(1);
      expect(d).toBe(sendingData);

      done();
    } );
    server.emit(PlayerEvent.SEEK, sendingData);
  } );

  it("seek (invalid type data)", (done) => {
    const sendingData = {
      a: 1,
    };
    const socket: Socket = (client as any).getSocket();

    socketErrorHandler(socket, PlayerEvent.SEEK, (error) => {
      expect(error.message).toBe("val is not string or number");

      done();
    } );
    server.emit(PlayerEvent.SEEK, sendingData);
  } );
} );

function socketErrorHandler(socket: Socket, eventType: string, handler: (error: Error)=> void) {
  const listeners = socket.listeners(eventType);

  expect(listeners).toHaveLength(1);

  const [listener] = listeners;

  socket.off(eventType, listener);

  socket.on(eventType, (data) => {
    try {
      listener(data);
    } catch (e) {
      if (!(e instanceof Error))
        throw e;

      handler(e);
    }
  } );
}
