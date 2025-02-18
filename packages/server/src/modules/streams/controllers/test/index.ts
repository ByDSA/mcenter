import { PublicMethodsOf } from "#shared/utils/types";
import { StreamsRestController } from "../RestController";
import { getRouterMock } from "#tests/main";

export class StreamRestControllerMock implements PublicMethodsOf<StreamsRestController> {
  getRouter = getRouterMock;

  getAll = jest.fn();

  getMany = jest.fn();
}
