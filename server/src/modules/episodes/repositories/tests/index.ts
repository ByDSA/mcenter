import { PublicMethodsOf } from "#utils/types";
import Repository from "../Repository";

export class EpisodeRepositoryMock implements PublicMethodsOf<Repository> {
  getAllFromSerieId = jest.fn();

  findLastEpisodeInHistoryList = jest.fn();

  getOneById = jest.fn();

  getManyBySerieId = jest.fn();

  updateOneByIdAndGet = jest.fn();

  patchOneByIdAndGet = jest.fn();

  createManyAndGet = jest.fn();
}