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

    const { SERVER: url, SECRET_TOKEN: secretToken } = getEnvs();

    this.#webSocketsService.startSocket( {
      url,
      secretToken,
    } );
  }
}
