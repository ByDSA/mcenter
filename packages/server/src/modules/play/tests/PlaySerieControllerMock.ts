import { PublicMethodsOf } from "#shared/utils/types";
import { PlaySerieController } from "../PlaySerieController";
import { getRouterMock } from "#tests/main";

export class PlaySerieControllerMock implements PublicMethodsOf<PlaySerieController> {
  playSerie = jest.fn();

  getRouter = getRouterMock;

  setHttpServer = jest.fn();
}
