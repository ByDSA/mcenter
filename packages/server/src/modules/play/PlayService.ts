import { Episode } from "#modules/episodes";
import { PublicMethodsOf } from "#shared/utils/types";
import { assertIsNotEmpty } from "#shared/utils/validation";
import { VlcBackWebSocketsServerService as PlayerWebSocketsServerService } from "./remote-player";

type Params = {
  playerWebSocketsServerService: PublicMethodsOf<PlayerWebSocketsServerService>;
};

type PlayParams = {
  force?: boolean;
  episodes: Episode[];
};
export default class PlayService {
  #vlcBackWebSocketsServerService: PublicMethodsOf<PlayerWebSocketsServerService>;

  constructor( {playerWebSocketsServerService}: Params) {
    this.#vlcBackWebSocketsServerService = playerWebSocketsServerService;
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