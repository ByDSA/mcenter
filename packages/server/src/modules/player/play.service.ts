import { Injectable } from "@nestjs/common";
import { assertIsNotEmpty } from "$shared/utils/validation";
import { MediaElement } from "$shared/models/player";
import { VlcBackWebSocketsServerService } from "./player-services";

type PlayParams = {
  force?: boolean;
  mediaElements: MediaElement[];
};

@Injectable()
export class PlayService {
  constructor(
    private readonly vlcBackWSServerService: VlcBackWebSocketsServerService,
  ) { }

  async play( { mediaElements, force }: PlayParams): Promise<void> {
    assertIsNotEmpty(mediaElements);

    await this.vlcBackWSServerService.emitPlayResource( {
      mediaElements,
      force,
    } );
  }
}
