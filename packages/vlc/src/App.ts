import { getEnvs } from "./Envs";
import { WebSocketsService } from "./modules/ws-client";

type Params = {
  webSocketsService: WebSocketsService;
};
export class App {
  #webSocketsService: WebSocketsService | undefined;

  constructor() {
  }

  addDependencies( { webSocketsService }: Params) {
    this.#webSocketsService = webSocketsService;
  }

  start() {
    if (!this.#webSocketsService)
      throw new Error("webSocketsService is not defined");

    const { WS_SERVER_HOST: host, WS_SERVER_PATH: path, WS_SERVER_PORT: port } = getEnvs();

    this.#webSocketsService.startSocket( {
      host,
      port,
      path,
    } );
  }
}
