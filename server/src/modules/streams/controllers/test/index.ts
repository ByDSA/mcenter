import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import RestController from "../RestController";

export class StreamRestControllerMock implements PublicMethodsOf<RestController> {
  getRouter = getRouterMock;

  getAll = jest.fn();

  getMany = jest.fn();
}