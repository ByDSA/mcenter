import { PublicMethodsOf } from "#utils/types";
import Repository from "../Repository";

export class SerieRepositoryMock implements PublicMethodsOf<Repository> {
  getAll = jest.fn();

  createOneAndGet = jest.fn();

  getOneById = jest.fn();

  updateOneByIdAndGet = jest.fn();
}