import { PublicMethodsOf } from "#shared/utils/types";
import Repository from "../Repository";

export class EpisodeRepositoryMock implements PublicMethodsOf<Repository> {
  getOneByIdOrCreate = jest.fn();

  getAllBySerieId = jest.fn();

  findLastEpisodeInHistoryList = jest.fn();

  getOneById = jest.fn();

  getManyBySerieId = jest.fn();

  updateOneByIdAndGet = jest.fn();

  patchOneByIdAndGet = jest.fn();

  createManyAndGet = jest.fn();

  patchOneByPathAndGet = jest.fn();

  getOneByPath = jest.fn();
}