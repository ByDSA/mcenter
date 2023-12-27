import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import Controller from "../Controller";

export class MusicControllerMock implements PublicMethodsOf<Controller> {
  getRouter = getRouterMock;
}