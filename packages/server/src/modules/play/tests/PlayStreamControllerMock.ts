import { PublicMethodsOf } from "#shared/utils/types";
import PlayStreamController from "../PlayStreamController";
import { getRouterMock } from "#tests/main";

export default class PlayStreamControllerMock implements PublicMethodsOf<PlayStreamController> {
  playStream = jest.fn();

  getRouter = getRouterMock;

  setHttpServer = jest.fn();
}
