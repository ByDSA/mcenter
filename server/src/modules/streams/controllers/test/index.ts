import { PublicMethodsOf } from "#shared/utils/types";
import RestController from "../RestController";

export class StreamRestControllerMock implements PublicMethodsOf<RestController> {
  getRouter = jest.fn();

  getAll = jest.fn();

  getMany = jest.fn();
}