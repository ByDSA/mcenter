import { PublicMethodsOf } from "#shared/utils/types";
import RestController from "../RestController";
import { getRouterMock } from "#tests/main";

export class EpisodeRestControllerMock implements PublicMethodsOf<RestController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;

  getAll = jest.fn();

  patchOneByIdAndGet = jest.fn();

  getManyBySearch = jest.fn();
}
