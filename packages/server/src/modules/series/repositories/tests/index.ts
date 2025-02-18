import { PublicMethodsOf } from "#shared/utils/types";
import { SerieRepository } from "../Repository";

export class SerieRepositoryMock implements PublicMethodsOf<SerieRepository> {
  getOneById = jest.fn();

  getAll = jest.fn();

  createOneAndGet = jest.fn();

  updateOneByIdAndGet = jest.fn();
}
