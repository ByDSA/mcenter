import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import { MusicController } from "../Controller";

export class MusicControllerMock implements PublicMethodsOf<MusicController> {
  getRouter = getRouterMock;
}
