import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";

type GetHttpServer = ()=> HttpServer;
type Params = {
  getHttpServer: GetHttpServer;
};
export default class WebSocketsService {
  #io: Server | undefined;

  #getHttpServer: GetHttpServer;

  constructor( {getHttpServer}: Params) {
    this.#getHttpServer = getHttpServer;
  }

  startSocket() {
    if (!this.#io) {
      this.#io = new Server(this.#getHttpServer(), {
        path: "/ws/",
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      } );

      console.log("Servidor WebSocket iniciado!");

      this.#io.on("asdf", (socket: Socket) => {
        console.log("a user connected");

        socket.on("test", () => {
          console.log("ws test");
        } );
      } );
    }
  }
}