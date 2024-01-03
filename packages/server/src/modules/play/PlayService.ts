import { Episode } from "#modules/episodes";
import { PublicMethodsOf } from "#shared/utils/types";
import { assertIsNotEmpty } from "#shared/utils/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
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
  #vlcBackWebSocketsServerService: PublicMethodsOf<VlcBackWebSocketsServerService>;

  constructor(deps?: Partial<Deps>) {
    this.#vlcBackWebSocketsServerService = (deps as Deps).playerWebSocketsServerService;
  }

  async play( {episodes, force}: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    this.#vlcBackWebSocketsServerService.playResource( {
      resources: episodes,
      force,
    } );

    return true;
  }
}