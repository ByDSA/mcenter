import { PublicMethodsOf } from "#shared/utils/types";
import Controller from "../Controller";
import { getRouterMock } from "#tests/main";

export class MusicControllerMock implements PublicMethodsOf<Controller> {
  getRouter = getRouterMock;
}
