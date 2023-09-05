import { PublicMethodsOf } from "#utils/types";
import Repository from "../Repository";

export default class RepositoryMock implements PublicMethodsOf<Repository> {
  createOne = jest.fn();

  getOneById = jest.fn();

  updateOneById = jest.fn();

  createOneEntry = jest.fn();

  getAll = jest.fn();
}