import { PublicMethodsOf } from "#shared/utils/types";
import Controller from "../Controller";

export class MusicControllerMock implements PublicMethodsOf<Controller> {
  getRouter = jest.fn();
}