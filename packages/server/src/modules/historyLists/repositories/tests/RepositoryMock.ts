import { PublicMethodsOf } from "#shared/utils/types";
import { HistoryListRepository } from "../Repository";

export class HistoryListRepositoryMock implements PublicMethodsOf<HistoryListRepository> {
  createOne = jest.fn();

  getOneByIdOrCreate = jest.fn();

  updateOneById = jest.fn();

  createOneEntry = jest.fn();

  getAll = jest.fn();
}
