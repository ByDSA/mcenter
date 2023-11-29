import { PublicMethodsOf } from "#shared/utils/types";
import Repository from "../Repository";

export default class RepositoryMock implements PublicMethodsOf<Repository> {
  createOne = jest.fn();

  getOneByIdOrCreate = jest.fn();

  updateOneById = jest.fn();

  createOneEntry = jest.fn();

  getAll = jest.fn();
}