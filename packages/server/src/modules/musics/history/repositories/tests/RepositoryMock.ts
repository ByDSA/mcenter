import { PublicMethodsOf } from "#shared/utils/types";
import Repository from "../Repository";

export default class RepositoryMock implements PublicMethodsOf<Repository> {
  getManyCriteria = jest.fn();

  getLast = jest.fn();

  createOne = jest.fn();

  getAll = jest.fn();
}