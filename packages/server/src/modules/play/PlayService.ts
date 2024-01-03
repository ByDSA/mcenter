import { Episode } from "#modules/episodes";
import { assertIsNotEmpty } from "#shared/utils/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Server } from "node:http";
import { VlcBackWebSocketsServerService } from "./remote-player";

type PlayParams = {
  force?: boolean;
  episodes: Episode[];
};

const DepsMap = {
  playerWebSocketsServerService: VlcBackWebSocketsServerService,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class PlayService {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  setHttpServer(server: Server) {
    this.#deps.playerWebSocketsServerService.setHttpServer(server);
  }

  async play( {episodes, force}: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    this.#deps.playerWebSocketsServerService.playResource( {
      resources: episodes,
      force,
    } );

    return true;
  }
}