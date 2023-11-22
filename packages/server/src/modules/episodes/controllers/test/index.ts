import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import RestController from "../RestController";

export class EpisodeRestControllerMock implements PublicMethodsOf<RestController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;

  getAll = jest.fn();

  patchOneByIdAndGet = jest.fn();

  getManyBySearch = jest.fn();
}