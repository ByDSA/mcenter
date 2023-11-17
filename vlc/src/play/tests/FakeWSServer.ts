
import { Server as HttpServer, createServer } from "node:http";
import { Server } from "socket.io";

type StartParams = {
  port: number;
};
export default class FakeWSServer {
  #fakeServer: Server;

  httpServer: HttpServer | undefined;

  constructor() {
    this.#fakeServer = this.#create();
  }

  // eslint-disable-next-line class-methods-use-this
  #create() {
    const fakeServer = new Server();

    fakeServer.on("connection", (socket) => {
    // Aquí puedes simular eventos específicos del servidor
      socket.on("fakeEvent", (data) => {
        fakeServer.emit("responseEvent", `Server received: ${data}`);
      } );
    } );

    return fakeServer;
  }

  start( {port = 3000}: StartParams) {
    this.httpServer = createServer();

    this.httpServer.listen(port, () => {
      console.log("Fake server listening on port 3000");
    } );

    this.#fakeServer.listen(this.httpServer);
  }

  close() {
    return this.#fakeServer.close();
  }
}
