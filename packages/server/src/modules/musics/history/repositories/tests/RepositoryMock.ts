import { PublicMethodsOf } from "#shared/utils/types";
import Repository from "../Repository";

export default class RepositoryMock implements PublicMethodsOf<Repository> {
  createOne = jest.fn();

  getAll = jest.fn();
}