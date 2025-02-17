import { PublicMethodsOf } from "#shared/utils/types";
import { PlayService } from "../PlayService";

export class PlayServiceMock implements PublicMethodsOf<PlayService> {
  play = jest.fn();

  setHttpServer = jest.fn();
}
