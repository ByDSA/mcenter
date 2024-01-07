import { Episode } from "#modules/episodes";
import { assertIsNotEmpty } from "#shared/utils/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { VlcBackWebSocketsServerService } from "./player-services";

type PlayParams = {
  force?: boolean;
  episodes: Episode[];
};

const DepsMap = {
  vlcBackWSServerService: VlcBackWebSocketsServerService,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class PlayService {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async play( {episodes, force}: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    await this.#deps.vlcBackWSServerService.emitPlayResource( {
      resources: episodes,
      force,
    } );

    return true;
  }
}