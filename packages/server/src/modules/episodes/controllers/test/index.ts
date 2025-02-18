import { PublicMethodsOf } from "#shared/utils/types";
import { EpisodesRestController } from "../RestController";
import { getRouterMock } from "#tests/main";

export class EpisodeRestControllerMock implements PublicMethodsOf<EpisodesRestController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;

  getAll = jest.fn();

  patchOneByIdAndGet = jest.fn();

  getManyBySearch = jest.fn();
}
