import { Injectable } from "@nestjs/common";
import { assertIsNotEmpty } from "$shared/utils/validation";
import { EpisodeEntity } from "#episodes/models";
import { VlcBackWebSocketsServerService } from "./player-services";

type PlayParams = {
  force?: boolean;
  episodes: EpisodeEntity[];
};

@Injectable()
export class PlayService {
  constructor(private readonly vlcBackWSServerService: VlcBackWebSocketsServerService) {
  }

  async play( { episodes, force }: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    await this.vlcBackWSServerService.emitPlayResource( {
      resources: episodes,
      force,
    } );

    return true;
  }
}
