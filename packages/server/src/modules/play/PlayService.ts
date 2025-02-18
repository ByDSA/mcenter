import { assertIsNotEmpty } from "#shared/utils/validation";
import { VlcBackWebSocketsServerService } from "./player-services";
import { Episode } from "#episodes/models";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

type PlayParams = {
  force?: boolean;
  episodes: Episode[];
};

const DEPS_MAP = {
  vlcBackWSServerService: VlcBackWebSocketsServerService,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class PlayService {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async play( { episodes, force }: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    await this.#deps.vlcBackWSServerService.emitPlayResource( {
      resources: episodes,
      force,
    } );

    return true;
  }
}
