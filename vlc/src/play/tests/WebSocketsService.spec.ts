import { connect, Socket } from "socket.io-client";
import FakeWsServer from "./FakeWSServer";

let fakeWsServer: FakeWsServer;
let clientSocket: Socket;
const PORT = Math.floor(Math.random() * 1000 + 3000);

beforeAll(() => {
  fakeWsServer = new FakeWsServer();
  fakeWsServer.start( {
    port: PORT,
  } );
} );

afterAll(() => {
  fakeWsServer.close();
} );

beforeEach((done) => {
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

test("should receive a response from the fake server", (done) => {
  const testData = "Hello, server!";

  // Simula un evento desde el cliente al servidor ficticio
  clientSocket.emit("fakeEvent", testData);

  // Espera la respuesta del servidor ficticio
  clientSocket.on("responseEvent", (response) => {
    expect(response).toBe(`Server received: ${testData}`);
    done();
  } );
} );
