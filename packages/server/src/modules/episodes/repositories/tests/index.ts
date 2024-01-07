import { PublicMethodsOf } from "#shared/utils/types";
import EpisodesRepository from "../Repository";

export class EpisodeRepositoryMock implements PublicMethodsOf<EpisodesRepository> {
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

  getAll = jest.fn();
}