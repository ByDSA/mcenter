import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import RemotePlayerController from "../Controller";

export default class ControllerMock implements PublicMethodsOf<RemotePlayerController> {
  getRouter = getRouterMock;

  getStatus = jest.fn();

  pauseToggle = jest.fn();

  getPlaylist = jest.fn();
}