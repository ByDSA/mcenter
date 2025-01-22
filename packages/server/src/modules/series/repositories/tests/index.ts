import { PublicMethodsOf } from "#shared/utils/types";
import SeriesRepository from "../Repository";

export class SerieRepositoryMock implements PublicMethodsOf<SeriesRepository> {
  getOneById = jest.fn();

  getAll = jest.fn();

  createOneAndGet = jest.fn();

  updateOneByIdAndGet = jest.fn();
}
