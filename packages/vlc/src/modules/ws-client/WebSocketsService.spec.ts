import PlayerService from "#modules/PlayerService";
import PlayerServiceMock from "#modules/player-service/tests/PlayerServiceMock";
import { PlayerEvent } from "#shared/models/player";
import { Socket } from "socket.io-client";
import WebSocketsService from "./WebSocketsService";
import FakeWSServer from "./tests/FakeWSServer";

let client: WebSocketsService;
let server: FakeWSServer;
let playerService: PlayerService;

beforeAll(async () => {
  playerService = new PlayerServiceMock();
  server = new FakeWSServer();
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
      expect(playerService.pauseToggle).toBeCalledTimes(1);
      done();
    } );
    server.emit(PlayerEvent.PAUSE_TOGGLE, undefined);
  } );

  it("next", (done) => {
    playerService.next = jest.fn(async () => {
      expect(playerService.next).toBeCalledTimes(1);
      done();
    } );
    server.emit(PlayerEvent.NEXT, undefined);
  } );

  it("previous", (done) => {
    playerService.previous = jest.fn(async () => {
      expect(playerService.previous).toBeCalledTimes(1);
      done();
    } );
    server.emit(PlayerEvent.PREVIOUS, undefined);
  } );

  it("stop", (done) => {
    playerService.stop = jest.fn(async () => {
      expect(playerService.stop).toBeCalledTimes(1);
      done();
    } );
    server.emit(PlayerEvent.STOP, undefined);
  } );

  it("play", (done) => {
    const ID = 1;

    playerService.play = jest.fn(async (id) => {
      expect(playerService.play).toBeCalledTimes(1);
      expect(id).toBe(ID);
      done();
    } );
    server.emit(PlayerEvent.PLAY, ID);
  } );

  it("seek (valid string)", (done) => {
    const DATA = "+5";

    playerService.seek = jest.fn(async (data) => {
      expect(playerService.seek).toBeCalledTimes(1);
      expect(data).toBe(DATA);
      done();
    } );
    server.emit(PlayerEvent.SEEK, DATA);
  } );

  it("seek (valid number)", (done) => {
    const DATA = 1;

    playerService.seek = jest.fn(async (data) => {
      expect(playerService.seek).toBeCalledTimes(1);
      expect(data).toBe(DATA);
      done();
    } );
    server.emit(PlayerEvent.SEEK, DATA);
  } );

  it("seek (invalid type data)", (done) => {
    const DATA = {
      a: 1,
    };
    const socket: Socket = (client as any).getSocket();

    socketErrorHandler(socket, PlayerEvent.SEEK, (error) => {
      expect(error.message).toBe("val is not string or number");
      done();
    } );
    server.emit(PlayerEvent.SEEK, DATA);
  } );
} );

function socketErrorHandler(socket: Socket, eventType: string, handler: (error: Error)=> void) {
  const listeners = socket.listeners(eventType);

  expect(listeners.length).toBe(1);

  const listener = listeners[0];

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