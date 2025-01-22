import { PublicMethodsOf } from "#shared/utils/types";
import RestController from "../RestController";
import { getRouterMock } from "#tests/main";

export class StreamRestControllerMock implements PublicMethodsOf<RestController> {
  getRouter = getRouterMock;

  getAll = jest.fn();

  getMany = jest.fn();
}
