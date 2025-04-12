import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import { EpisodesRestController } from "../RestController";

export class EpisodeRestControllerMock implements PublicMethodsOf<EpisodesRestController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;

  getAll = jest.fn();

  patchOneByIdAndGet = jest.fn();

  getManyBySearch = jest.fn();
}
