import { PublicMethodsOf } from "#shared/utils/types";
import { MusicController } from "../Controller";
import { getRouterMock } from "#tests/main";

export class MusicControllerMock implements PublicMethodsOf<MusicController> {
  getRouter = getRouterMock;
}
