import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import { StreamsRestController } from "../RestController";

export class StreamRestControllerMock implements PublicMethodsOf<StreamsRestController> {
  getRouter = getRouterMock;

  getAll = jest.fn();

  getMany = jest.fn();
}
