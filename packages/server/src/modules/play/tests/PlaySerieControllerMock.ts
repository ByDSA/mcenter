import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import { PlaySerieController } from "../PlaySerieController";

export class PlaySerieControllerMock implements PublicMethodsOf<PlaySerieController> {
  playSerie = jest.fn();

  getRouter = getRouterMock;

  setHttpServer = jest.fn();
}
