import { PublicMethodsOf } from "#shared/utils/types";
import Repository from "../Repository";

export class EpisodeFileInfoRepositoryMock implements PublicMethodsOf<Repository> {
  updateOneBySuperId = jest.fn();

  updateMany = jest.fn();

  getOneByPath = jest.fn();

  getAllBySuperId = jest.fn();
}