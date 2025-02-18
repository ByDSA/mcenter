import { Server as HttpServer, createServer } from "node:http";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Server } from "socket.io";

type StartParams = {
  port: number;
};
export class FakeWsServer {
  #server: Server;

  #eventHandlers: Record<string, (data: any)=> void> = {};

  httpServer: HttpServer | undefined;

  #port: number | undefined;

  #path = "/";

  #host = "localhost";

  constructor() {
    this.#server = this.#create();
  }

  #create() {
    const fakeServer = new Server( {
      path: this.#path,
    } );

    return fakeServer;
  }

  onReceive(event: string, callback: (data: any)=> void) {
    this.#eventHandlers[event] = callback;
  }

  emit(event: string, data: any) {
    this.#server.emit(event, data);
  }

  async start(params?: StartParams): Promise<void> {
    this.httpServer = createServer();
    await new Promise<void>((resolve) => {
      const port = params?.port ?? 0;
      const listener = this.httpServer?.listen(port, () => {
        const address = listener?.address();

        if (!address)
          throw new Error(`listener is ${address}`);

        if (typeof address === "string")
          this.#port = +address;
        else
          this.#port = +address.port;

        console.log(`Fake server listening on port ${this.#port}`);
        resolve();
      } );
    } );

    this.#server.listen(this.httpServer);

    this.#server.on("connection", (socket) => {
      for (const [event, handler] of Object.entries(this.#eventHandlers))
        socket.on(event, handler);
    } );
  }

  close() {
    return this.#server.close();
  }

  getPort() {
    return this.#port;
  }

  getPath() {
    return this.#path;
  }

  getHost() {
    return this.#host;
  }
}
