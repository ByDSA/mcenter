import { Server as HttpServer, createServer } from "node:http";
import { Server, Socket } from "socket.io";

type StartParams = {
  port: number;
};
export default class FakeWSServer {
  #server: Server;

  #socket: Socket | undefined;

  #eventHandlers: Record<string, (data: any)=> void> = {
  };

  httpServer: HttpServer | undefined;

  #port: number | undefined;

  #path = "/";

  #host = "localhost";

  constructor() {
    this.#server = this.#create();
  }

  // eslint-disable-next-line class-methods-use-this
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
      const PORT = params?.port ?? 0;
      const listener = this.httpServer?.listen(PORT, () => {
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
      this.#socket = socket;

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
