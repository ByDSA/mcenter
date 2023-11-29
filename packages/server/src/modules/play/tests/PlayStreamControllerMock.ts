import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import PlayStreamController from "../PlayStreamController";

export default class PlayStreamControllerMock implements PublicMethodsOf<PlayStreamController> {
  playStream = jest.fn();

  getRouter = getRouterMock;
}