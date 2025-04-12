import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import { PlayStreamController } from "../PlayStreamController";

export class PlayStreamControllerMock implements PublicMethodsOf<PlayStreamController> {
  playStream = jest.fn();

  getRouter = getRouterMock;

  setHttpServer = jest.fn();
}
