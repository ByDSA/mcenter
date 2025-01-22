import { PublicMethodsOf } from "#shared/utils/types";
import RemotePlayerController from "../Controller";
import { getRouterMock } from "#tests/main";

export default class ControllerMock implements PublicMethodsOf<RemotePlayerController> {
  getRouter = getRouterMock;

  getStatus = jest.fn();

  pauseToggle = jest.fn();

  getPlaylist = jest.fn();
}
