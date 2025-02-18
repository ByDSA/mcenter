/* eslint-disable jest/no-done-callback */
import { connect, Socket } from "socket.io-client";
import { FakeWsServer } from "./FakeWsServer";

let fakeWsServer: FakeWsServer;
let clientSocket: Socket;
const PORT = Math.floor((Math.random() * 1000) + 3000);
const FAKE_EVENT_PING_CLIENT = "pingClient";
const FAKE_EVENT_PONG_SERVER = "pongServer";
const FAKE_EVENT_FROM_CLIENT = "fakeEventClient";
const fakeEventServerHandler = jest.fn();
const PING_MSG = "ping";
const PONG_MSG = "pong";

beforeAll(async () => {
  fakeWsServer = new FakeWsServer();
  await fakeWsServer.start( {
    port: PORT,
  } );
  fakeWsServer.onReceive(FAKE_EVENT_FROM_CLIENT, fakeEventServerHandler);
  fakeWsServer.onReceive(FAKE_EVENT_PING_CLIENT, (data) => {
    if (data === PING_MSG)
      fakeWsServer.emit(FAKE_EVENT_PONG_SERVER, PONG_MSG);
  } );
}, 500);

afterAll(() => {
  fakeWsServer.close();
} );

beforeEach((done) => {
  fakeEventServerHandler.mockClear();
  // Conecta un cliente antes de cada prueba
  clientSocket = connect(`ws://localhost:${PORT}`);
  clientSocket.on("connect", () => {
    done();
  } );
} );

afterEach(() => {
  // Desconecta el cliente después de cada prueba
  if (clientSocket.connected)
    clientSocket.disconnect();
} );

it("should receive a response from the fake server", (done) => {
  const testData = "Hello, server!";

  fakeEventServerHandler.mockImplementation((data) => {
    expect(data).toBe(testData);

    done();
  } );

  // Simula un evento desde el cliente al servidor ficticio
  clientSocket.emit(FAKE_EVENT_FROM_CLIENT, testData);
}, 500);

it("ping pong test", (done) => {
  clientSocket.emit(FAKE_EVENT_PING_CLIENT, PING_MSG);

  clientSocket.on(FAKE_EVENT_PONG_SERVER, (data) => {
    expect(data).toBe("pong");

    done();
  } );
}, 500);
