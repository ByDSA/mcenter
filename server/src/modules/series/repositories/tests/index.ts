import { PublicMethodsOf } from "#shared/utils/types";
import Repository from "../Repository";

export class SerieRepositoryMock implements PublicMethodsOf<Repository> {
  getOneById = jest.fn();

  getAll = jest.fn();

  createOneAndGet = jest.fn();

  updateOneByIdAndGet = jest.fn();
}